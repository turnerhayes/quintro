import { sql, type Transaction } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { customAlphabet } from 'nanoid';
import type { FilledCell, User, UserID } from '@/types/index';
import { ColorID } from '@/config';
import db from '@/server/persistence/db';
import { ServerGame, ServerPlayer } from '@/server/index.d';
import type { Database, Game as GameRow, Player as PlayerRow } from '@/server/persistence/types';
import { getUsers } from './user';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10);


interface GameRowWithPlayers extends GameRow {
    players: PlayerRow[];
};

const filledCellsToDatabaseJson = (filledCells: FilledCell[]): GameRow["board_filled_cells"] => {
    return filledCells.map((cell) => ({
        position: {
            x: cell.position[0],
            y: cell.position[1],
        },
        color: cell.color,
    }));
};

const gameRowToGame = (
    row: GameRowWithPlayers,
    users: {[id: UserID]: User;}
): ServerGame => {
    const rowPlayers = row.players;
    const players: ServerPlayer[] = [];

    for (let i = 0; i < rowPlayers.length; i++) {
        const rowPlayer = rowPlayers[i];
        players.push({
            id: rowPlayer.id,
            color: rowPlayer.color,
            user: rowPlayer.user_id == null ?
                undefined :
                users[rowPlayer.user_id],
            sessionID: rowPlayer.session_id,
        })
    }

    return {
        name: row.name,
        board: {
            width: row.board_width,
            height: row.board_height,
            filledCells: row.board_filled_cells.map((
                cell: {
                    position: {
                        x: number; y: number;
                    };
                    color?: string;
                }) => ({
                    position: [cell.position.x, cell.position.y],
                    color: cell.color,
                })
            ),
        },
        players,
        playerLimit: row.player_limit,
        createdAtTimestamp: row.created_at.getTime(),
        startedAtTimestamp:  row.started_at?.getTime() ?? null,
        endedAtTimestamp: row.ended_at?.getTime() ?? null,
        winnerIndex: row.winner_index,
        playerPresence: {},
    } as ServerGame;
};

export const getGame = async (
    {
        name,
    }: {
        name: string;
    }
): Promise<ServerGame|null> => {
    const result = await db
        .selectFrom("games")
        .selectAll("games")
        .select((eb) => [
            jsonArrayFrom(
                eb.selectFrom('players')
                    .selectAll('players')
                    .whereRef('players.game_name', '=', 'games.name')
                    .orderBy('players.index', 'asc')
            ).as("players"),
        ])
        .where("games.name", "=", name)
        .executeTakeFirst();

    if (!result) {
        return null;
    }

    const userIDs: UserID[] = result.players.reduce(
        (ids, player) => {
            if (player.user_id != null) {
                ids.push(player.user_id);
            }

            return ids;
        },
        [] as UserID[]
    );

    const users = await getUsers({
        ids: userIDs,
    });

    return gameRowToGame(result, users);
};

export const updateGame = async (game: ServerGame) => {
    const result = await db.updateTable("games")
        .set({
            winner_index: game.winnerIndex,
            board_width: game.board.width,
            board_height: game.board.height,
            board_filled_cells: JSON.stringify(
                filledCellsToDatabaseJson(game.board.filledCells)
            ),
            started_at: game.startedAtTimestamp == null ?
                null :
                new Date(game.startedAtTimestamp),
            ended_at: game.endedAtTimestamp == null ?
                null :
                new Date(game.endedAtTimestamp),
        })
        .where("name", "=", game.name)
        .returningAll("games")
        .executeTakeFirst();
    
    if (!result) {
        throw new Error(`Could not get a result from game update`);
    }
};

export const createGame = async (
    {
        width,
        height,
        playerLimit,
        transaction,
    }: {
        width: number;
        height: number;
        playerLimit: number;
        transaction?: Transaction<Database>;
    }
) => {
    const dbInstance = transaction || db;
    const gameName = nanoid();
    //TODO: Validate input values
    const result = await dbInstance.insertInto("games")
        .values({
            name: gameName,
            board_width: width,
            board_height: height,
            board_filled_cells: JSON.stringify([]),
            player_limit: playerLimit,
        })
        .returning("name")
        .executeTakeFirst();

    if (!result) {
        throw new Error("Failed to create game");
    }

    return result.name;
};

export const startGame = async (
    {
        gameName,
        transaction,
    }:{
        gameName: string;
        transaction?: Transaction<Database>;
    }
): Promise<Date> => {
    const dbInstance = transaction || db;
    const game = await getGame({
        name: gameName,
    });

    if (!game) {
        throw new Error("Game not found");
    }
    if (game.startedAtTimestamp !== null) {
        throw new Error("Game has already started");
    }
    const result = await dbInstance.updateTable("games")
        .set({
            started_at: sql`now()`,
        })
        .where("name", "=", gameName)
        .returning("started_at")
        .executeTakeFirst();

    if (!result) {
        throw new Error("Failed to start game");
    }

    return result.started_at!;
}

export const findGames = async (
    {
        playerLimit,
        includeFullGames = false,
    }: {
        playerLimit: number | null;
        includeFullGames?: boolean;
    }
): Promise<Array<{ name: string; player_limit: number; player_count: number; }>> => {
    let query = db.with(
        "player_counts",
        (qb) => qb
            .selectFrom("players")
            .select(({ eb }) => [
            "players.game_name",
            eb.cast<number>(eb.fn.count("players.id"), "integer").as("raw_player_count"),
            ])
            .groupBy("players.game_name")
    )
    .with(
        "game_with_counts",
        (qb) =>
        qb
            .selectFrom("games")
            .leftJoin("player_counts", "player_counts.game_name", "games.name")
            .select(({ eb, fn }) => [
            "games.name",
            "games.player_limit",
            "games.started_at",
            "games.ended_at",
            fn.coalesce("player_counts.raw_player_count", eb.val(0)).as("player_count"),
        ])
    )
    .selectFrom("game_with_counts")
    .selectAll()
    .where("started_at", "is", null)
    .where("ended_at", "is", null);

    if (!includeFullGames) {
        query = query.whereRef("player_count", "<", "player_limit");
    }

    if (playerLimit !== null) {
        query = query.where("player_limit", "=", playerLimit);
    }

    const results = await query.execute();
    return results.map(game => ({
        name: game.name,
        player_limit: game.player_limit,
        player_count: game.player_count || 0,
    }));
}

export const joinGame = async (
    {
        gameName,
        color,
        userID,
        sessionID,
        transaction,
    }: {
        gameName: string;
        color: ColorID;
        userID?: number;
        sessionID: string;
        transaction?: Transaction<Database>;
    }
): Promise<void> => {
    const dbInstance = transaction || db;
    const game = await getGame({
        name: gameName,
    });
    if (!game) {
        throw new Error("Game not found");
    }
    if (game.startedAtTimestamp !== null) {
        throw new Error("Game has already started");
    }
    if (game.players.length >= game.playerLimit) {
        throw new Error("Game is full");
    }
    if (game.players.some(player => player.color === color)) {
        throw new Error("Color already taken");
    }

    const result = await dbInstance.insertInto("players")
        .values({
            game_name: gameName,
            color,
            user_id: userID,
            index: game.players.length, // Assign index based on current player count
            session_id: sessionID,
        })
        .returning("id")
        .executeTakeFirst();

    if (!result) {
        throw new Error("Failed to join game");
    }
};
