import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { BoardPosition, Game, GameID, GameSummary } from "@root/types";
import { ColorID } from "@root/config";

const SERVER_URL = "http://localhost:8070"; //TODO: Inject this from environment variables

export const gamesApi = createApi({
    reducerPath: "games",
    baseQuery: fetchBaseQuery({
        baseUrl: `${SERVER_URL}/api`,
    }),
    endpoints: (builder) => ({
        getGame: builder.query<Game, {gameName: GameID;}>({
            query: ({gameName}) => ({
                url: `/games/${gameName}`,
                method: "GET",
                }),
        }),

        findGames: builder.query<GameSummary[], { numberOfPlayers: number | null }>({
            query: ({ numberOfPlayers }) => ({
                url: "/games",
                method: "GET",
                params: {
                    playerLimit: numberOfPlayers ?? undefined,
                },
            }),
            transformResponse: (response: Array<{
                name: string;
                player_limit: number;
                player_count: number;
            }>) => response.map((game) => ({
                name: game.name,
                playerLimit: game.player_limit,
                playerCount: game.player_count,
            })),
        }),
        joinGame: builder.mutation<void, { gameName: GameID; colors?: string[] }>({
            query: ({ gameName, colors }) => ({
                url: `/games/${gameName}/join`,
                method: "POST",
                body: {
                    colors,
                },
            }),
            async onQueryStarted({ gameName }, { dispatch, queryFulfilled }) {
                const { data: game } = await queryFulfilled;

                dispatch(
                    gamesApi.util.updateQueryData("getGame", { gameName }, (draft: Game) => {
                        Object.assign(draft, game);
                    })
                );
            },
        }),
        createGame: builder.mutation<GameID, { width: number; height: number; playerLimit: number }>({
            query: ({ width, height, playerLimit }) => ({
                url: "/games",
                method: "POST",
                body: {
                    width,
                    height,
                    playerLimit,
                },
            }),
            transformResponse: (response: { gameName: GameID }) => response.gameName,
        }),
        startGame: builder.mutation<void, { gameName: GameID }>({
            query: ({ gameName }) => ({
                url: `/games/${gameName}/start`,
                method: "PUT",
                body: {},
            }),
        }),
        placeMarble: builder.mutation<void, { gameName: GameID; position: BoardPosition; color: ColorID }>({
            query: ({ gameName, position, color }) => ({
                url: `/games/${gameName}/marble`,
                method: "POST",
                body: {
                    position,
                    color,
                },
            }),
        }),
    }),
});

export const {
    useGetGameQuery,
    useFindGamesQuery,
    useJoinGameMutation,
    useCreateGameMutation,
    useStartGameMutation,
    usePlaceMarbleMutation,
} = gamesApi;

export const findGames = async (
    {
        numberOfPlayers,
    }: {
        numberOfPlayers: number|null
    }
): Promise<GameSummary[]> => {
    const response = await fetch(`${SERVER_URL}/api/games`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            playerLimit: numberOfPlayers,
        }),
    });
    if (response.ok) {
        const responseJson = await response.json();
        return responseJson.map((game: {
            name: string;
            player_limit: number;
            player_count: number;
        }) => ({
            name: game.name,
            playerLimit: game.player_limit,
            playerCount: game.player_count,
        }));
    }
    console.error("Failed to fetch games:", response.statusText);
    if (response.status === 404) {
        console.warn("No games found");
    }
    if (response.status === 500) {
        console.error("Server error while fetching games");
    }
    if (response.status === 400) {
        console.error("Bad request while fetching games");
    }
    return [];
};

export const joinGame = async (
    {
        gameName,
        colors,
    }: {
        gameName: GameID;
        colors?: string[];
    }
): Promise<void> => {

};

export const createGame = async (
    {
        width,
        height,
        playerLimit,
    }: {
        width: number;
        height: number;
        playerLimit: number;
    }
): Promise<void> => {
    const response = await fetch(`${SERVER_URL}/api/games`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            width,
            height,
            playerLimit,
        }),
    });
    if (!response.ok) {
        const msg = `Failed to create game: ${response.statusText}`;
        console.error(msg);
        throw new Error(msg);
    }
    const result = await response.json();
    return result.gameName;
};

export const startGame = async (
    {
        gameName,
    }: {
        gameName: GameID;
    }
): Promise<void> => {
    const response = await fetch(`${SERVER_URL}/api/games/${gameName}/start`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        const msg = `Failed to start game: ${response.statusText}`
        console.error(msg);
        throw new Error(msg);
    }
}

export const placeMarble = async (
    {}: {
        gameName: GameID;
        position: BoardPosition;
        color: ColorID;
    }
) => {};
