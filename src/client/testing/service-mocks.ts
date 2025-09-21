import { http, HttpResponse, ws, delay as delayResponse, type DelayMode } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";
import Config from "@/config";
import type { Game } from "@/types";


const socketServer = ws.link(Config.api.origin);

export const GET_GAME_URL = `${Config.api.origin}/api/games/:gameName`;

const mergeGameWithDefault = (game?: Partial<Game>) => {
    const defaultGame: Game = {
        name: "test-game",
        board:  {
            width: 10,
            height: 10,
            filledCells: [],
        },
        playerLimit: 3,
        players: [],
        createdAtTimestamp: Date.now(),
        startedAtTimestamp: null,
        endedAtTimestamp: null,
        winnerIndex: null,
    };

    if (!game) {
        return defaultGame;
    }

    return {
        ...defaultGame,
        ...game,
        board: {
            ...defaultGame.board,
            ...(game.board ?? []),
            filledCells: [
                ...(game.board?.filledCells ?? [])
            ],
        },
    } as Game;
};

export const getGameHandler = (
    {
        game,
        delay,
    }: {
        game?: Partial<Omit<Game, "name">>;
        delay?: DelayMode | number;
    } = {}
) => {
    return http.get(GET_GAME_URL, async ({ params }) => {
        const { gameName } = params;

        const fullGame: Game = mergeGameWithDefault({
            name: gameName as string,
            ...game,
        });

        if (delay != null) {
            await delayResponse(delay)
        }

        return HttpResponse.json(fullGame);
    });
};

export const handlers = [
    getGameHandler(),
    http.get("*/socket.io/*", () => {
        return HttpResponse.text("ok");
    }),
    socketServer.addEventListener("connection", (connection) => {
        // const io = toSocketIo(connection);


    }),
];
