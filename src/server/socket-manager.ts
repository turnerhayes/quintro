import assert from "node:assert";
import { Server, Socket } from "socket.io";
import Config, { ColorID } from "@/config";
import { findQuintros } from "@/quintros";
import { BoardPosition, GameID, Player, UserID } from "@/types/index";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "@/types/sockets";
import { getGame, joinGame, startGame, updateGame } from "@/server/persistence/games";
import { ServerGame, ServerPlayer } from "@/server/index.d";
import { serverGameToGame } from "@/server/utils";


export class SocketError extends Error {
    readonly code: string;

    constructor(message: string, code: string) {
        super(message);
        this.code = code;
    }
}

interface BaseArgs {
    gameName: GameID;
}

interface PlaceMarbleHandlerArgs extends BaseArgs {
    position: BoardPosition;
    color: ColorID;
}

interface JoinGameHandlerArgs extends BaseArgs {
    color?: ColorID;
}

type AckCallback<A = void> = (args: {
    error: true;
    message: string;
    code: string;
} | A) => void;

const getNextColor = (currentPlayerColors: ColorID[]) => {
    return Config.game.colors.find(
        (colorDefinition) => !currentPlayerColors.includes(
            colorDefinition.id
        )
    );
};

const getCurrentPlayerIndex = (game: ServerGame): number|null => {
    if (game.startedAtTimestamp == null) {
        return null;
    }

    const filledCellCount = game.board.filledCells.length;

    if (filledCellCount == 0) {
        return 0;
    }

    const lastFilledCellColor = game.board.filledCells[filledCellCount - 1].color;

    assert(lastFilledCellColor, "Last filled cell in the game has no color; invalid game state");

    const playerIndex = (
        game.players.findIndex(
            ({color}) => color === lastFilledCellColor
        ) + 1
    ) % game.players.length;

    return playerIndex;
};

const addPlayerToGame = async (
    {
        socket,
        game,
        color,
    }: {
        socket: Socket;
        game: ServerGame;
        color?: ColorID;
    }
): Promise<number> => {
    // If the game is full, throw error
    if (game.players.length === game.playerLimit) {
        throw new SocketError("Game is full", "GAME_FULL");
    }

    if (game.startedAtTimestamp != null) {
        throw new SocketError("Game is already started", "GET_STARTED");
    }

    if (!color) {
        const nextColor = getNextColor(game.players.map(({color}) => color))?.id;
        if (!nextColor) {
            throw new SocketError(`No color available for new player`, "NO_COLOR_AVAILABLE");
        }

        color = nextColor;
    }

    if (game.players.find((player) => player.color === color)) {
        throw new SocketError(`Color ${color} is already in use by another player`, "COLOR_IN_USE");
    }

    if (!Config.game.colors.get(color)) {
        throw new SocketError(`Color ${color} is not a valid color. Must be one of the following: ${Config.game.colors.ids.join(", ")}`, "INVALID_COLOR");
    }

    const userID: UserID|undefined = socket.request.user?.id;

    joinGame({
        gameName: game.name,
        color,
        userID,
        sessionID: socket.request.session.id,
    });

    const playerIndex = game.players.findIndex((player) => player.color === color);

    return playerIndex;
}

const getSocketPlayerIndexes = (
    {
        socket,
        game,
    }: {
        socket: Socket;
        game: ServerGame;
    }
): {
    [key: ColorID]: number;
} => {
	const playerIndexes: {
        [key: ColorID]: number;
    } = {};
    console.log(`socket session ID: ${socket.request.session.id}`);

    for (let index = 0; index < game.players.length; index++) {
        const player = game.players[index];
        console.log(`Player session ID: ${player.sessionID}`);
        if (player.sessionID === socket.request.session.id) {
            playerIndexes[player.color] = index;
        }
    }

	return playerIndexes;
}


const resolvePlayerJoinData = async (
    {
        socket,
        game,
        colors,
    }: {
        socket: Socket;
        game: ServerGame;
        colors?: ColorID[];
    }
): Promise<ServerGame> => {
    const playerIndexes = getSocketPlayerIndexes({ socket, game });

    const missingColors = (colors ?? []).reduce(
        (missing, color) => {
            if (!(color in playerIndexes)) {
                missing.push(color);
            }

            return missing;
        },
        [] as ColorID[]
    );

    // This *should* never happen; the UI does not currently allow it, but this is here for sanity
    // checking/preventing malicious socket requests
    if (missingColors.length > 1) {
        const error = new Error("Cannot join more than one new player to a game at a time");
        (error as any).code = 'TOO_MANY_JOINERS';

        throw error;
    }

    if (missingColors.length == 1) {
        const color = missingColors[0];
    
        await addPlayerToGame({ socket, game, color });
        const updatedGame = await getGame({
            name: game.name,
        });
    
        if (updatedGame == null) {
            throw new Error(`Game ${game.name} was not found after adding a player`);
        }
        game = updatedGame;
    }

    return game;
};

class SocketManager {
    private watchers: {
        [key: GameID]: Array<{
            sessionID: string;
            userID: UserID;
        }>,
    } = {};

    constructor(private readonly io: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >) {
        this.io.use((socket, next) => {
            const session = socket.request.session;
            if (session) {
                socket.data.sessionID = session.id;
            }
            next();
        });
        
        this.io.on("connection", async (socket) => {
            this.handleConnection(socket);
        });
    }

    private stopWatchingGame(
        {
            socket,
            gameName,
        }: {
            socket: Socket;
            gameName: GameID;
        }
    ) {
        if (!(gameName in this.watchers)) {
            return;
        }

        const index = this.watchers[gameName].findIndex(
            ({ sessionID }) => socket.request.session.id === sessionID
        );

        if (index < 0) {
            return;
        }

        this.watchers[gameName].splice(index, 1);
    }

    private handleConnection(socket: Socket) {
        socket.on('board:place-marble', (args: PlaceMarbleHandlerArgs, fn: AckCallback) => {
            this.onPlaceMarble(socket, args, fn);
        });

        socket.on('game:connect', async ({gameName,}: {gameName: GameID;}) => {
            socket.join(gameName);
        });

        socket.on('game:watchers:get', (args: BaseArgs, fn: AckCallback<number>) => {
            this.onGetWatcherCount(socket, args, fn);
        });

        socket.on('game:join', (args: JoinGameHandlerArgs, fn: AckCallback<{
            players: Player[];
            selfPlayerIndexes: number[];
        }>) => {
            this.onJoinGame(socket, args, fn);
        });

        socket.on('game:start', (args: BaseArgs, fn: AckCallback) => {
            this.onStartGame(socket, args, fn);
        });

        socket.on('game:players:presence', (args: BaseArgs, fn: AckCallback<{
            presentColors: ColorID[];
        }>) => {
            this.onGetPlayerPresence(socket, args, fn);
        });

        socket.on('game:leave', (args: BaseArgs, fn: AckCallback) => {
            this.onLeaveGame(socket, args, fn);
        });
    }

    private async onPlaceMarble(
        socket: Socket,
        {
            gameName,
            position,
            color,
        }: PlaceMarbleHandlerArgs,
        fn: AckCallback
    ) {
        const game = await getGame({
            name: gameName
        });

        if (!game) {
            return fn({
                error: true,
                message: `Game with name ${gameName} not found`,
                code: "NO_GAME",
            });
        }

        if (game.startedAtTimestamp == null) {
            return fn({
                error: true,
                message: `Game with name ${gameName} is not started yet.`,
                code: "NOT_STARTED",
            })
        }

        const currentPlayerIndex = getCurrentPlayerIndex(game);

        if (currentPlayerIndex == null) {
            throw new Error(`Game ${gameName} is started but currentPlayerIndex is null`);
        }

        if (game.players[currentPlayerIndex].color !== color) {
            return fn({
                error: true,
                message: `It is not ${color}'s turn to play.`,
                code: "WRONG_COLOR",
            });
        }

        const filledCell = game.board.filledCells.find(
            (cell) => cell.position[0] === position[0] && cell.position[1] === position[1]
        );

        if (filledCell) {
            return fn({
                error: true,
                message: `The cell at position ${position} is already filled by ${color}`,
                code: 'CELL_OCCUPIED',
            });
        }

        game.board.filledCells.push({
            position,
            color,
        });

        const width = game.board.width;
        const height = game.board.height;

        const quintros = findQuintros(game.board.filledCells, width, height);

        if (quintros.length > 0) {
            game.winnerIndex = currentPlayerIndex;
            game.endedAtTimestamp = new Date().getTime();
        }

        try {
            await updateGame(game);
        }
        catch(err) {
            return fn({
                error: true,
                message: `Game ${gameName} was unable to be updated`,
                code: 'UPDATE_GAME_ERROR',
            });
        }

        socket.to(gameName).emit("board:marble:placed", {
            gameName,
            position,
            color
        });

        if (game.winnerIndex != null) {
            socket.to(gameName).emit("game:over", {
                gameName,
                winnerIndex: game.winnerIndex,
                quintros,
            });
        }

        fn();
    }

    private async onJoinGame(
        socket: Socket,
        {
            gameName,
            color,
        }: JoinGameHandlerArgs,
        fn: AckCallback<{
            players: Player[];
            selfPlayerIndexes: number[];
        }>
    ) {
        console.log("Joining game %s with color %s", gameName, color);
        try {
            let game = await getGame({
                name: gameName,
            });

            if (!game) {
                console.error(`Game with name ${gameName} not found`);
                return fn({
                    error: true,
                    message: `Game with name ${gameName} not found`,
                    code: "NO_GAME",
                });
            }

            socket.join(gameName);

            this.stopWatchingGame({
                socket,
                gameName,
            });

            game = await resolvePlayerJoinData({
                socket,
                colors: color == null ? undefined : [color],
                game,
            });

            const players = serverGameToGame(game).players;

            console.log("players:", players);

            const selfPlayerIndexes = players.reduce(
                (indexes, player, index) => {
                    if (player.sessionID === socket.request.session.id) {
                        indexes.push(index);
                    }
                    return indexes;
                },
                [] as number[]
            );

            fn({
                players,
                selfPlayerIndexes,
            })

            socket.broadcast.to(gameName).emit("game:players:joined", {
                players,
            });
        }
        catch(ex) {
            if (ex instanceof SocketError) {
                console.error(ex);
                return fn({
                    error: true,
                    message: ex.message,
                    code: ex.code
                });
            }

            throw ex;
        }
    }

    private async onStartGame(socket: Socket, { gameName }: BaseArgs, fn: AckCallback) {
        const game = await getGame({
            name: gameName,
        });

        if (!game) {
            return fn({
                error: true,
                message: `Game with name ${gameName} not found`,
                code: "NO_GAME",
            });
        }

        if (game.startedAtTimestamp != null) {
            return fn({
                error: true,
                message: `Game with name ${gameName} already started`,
                code: "GAME_ALREADY_STARTED",
            });
        }

        try {
            const startedAt = await startGame({
                gameName,
            });

            console.log("start timestamp:", startedAt);

            this.io.to(gameName).emit("game:started", {
                gameName,
                startedAtTimestamp: startedAt.getTime(),
            });

            fn();
        }
        catch (ex) {
            console.error(ex);
            return fn({
                error: true,
                message: ex instanceof Error ? ex.message : `${ex ?? ""}`,
                code: "START_GAME_ERROR",
            });
        }
    }

    private async onGetPlayerPresence(socket: Socket, { gameName }: BaseArgs, fn: AckCallback<{
        presentColors: ColorID[];
    }>) {
        const sockets = await this.io.in(gameName).fetchSockets();
        const game = await getGame({
            name: gameName,
        });

        if (!game) {
            return fn({
                error: true,
                message: `Game with name ${gameName} not found`,
                code: "NO_GAME",
            });
        }

        const playerSocketMap = game.players.reduce(
            (map, player) => {
                map[player.sessionID] = player;
                return map;
            },
            {} as {[sesionID: string]: ServerPlayer}
        );

        const colors = sockets.map(
            (socket) => playerSocketMap[socket.data.sessionID]?.color)
                .filter((color) => Boolean(color)
        );

        return colors;
    }

    private async onLeaveGame(socket: Socket, { gameName }: BaseArgs, fn: AckCallback) {
        const game = await getGame({
            name: gameName,
        });

        if (!game) {
            return fn({
                error: true,
                message: `Game with name ${gameName} not found`,
                code: "NO_GAME",
            });
        }

        const playerIndexes = getSocketPlayerIndexes({
            socket,
            game,
        });

        socket.to(gameName).emit("game:players:left", {
            playerIndexes: Object.values(playerIndexes),
        });

        fn();
    }

    private async onGetWatcherCount(socket: Socket, { gameName }: BaseArgs, fn: AckCallback<number>) {
        const sockets = await this.io.in(gameName).fetchSockets();

        const sessionIDs = new Set(sockets.map((socket) => socket.data.sessionID));

        const game = await getGame({
            name: gameName,
        });

        if (game == null) {
            return fn({
                error: true,
                message: `No game "${gameName}" found`,
                code: "NO_GAME_FOUND",
            });
        }

        const playerSessionIDs = new Set(game.players.map(({sessionID}) => sessionID));

        const watchers = sessionIDs.difference(playerSessionIDs);

        console.log("watchers:", watchers);

        fn(watchers.size);
    }
}

export default SocketManager;
