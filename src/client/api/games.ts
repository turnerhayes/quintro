import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import createDebugger from "debug";

import type { BoardPosition, Game, GameID, GameSummary } from "@/types";
import Config, { type ColorID } from "@/config";


const debug = createDebugger("quintro:client:api:games");

// const getGameBaseQuery = fetchBaseQuery({
//     baseUrl: `${Config.api.origin}/api`,
//     credentials: "include",
// });

// const wrappedGetGameBaseQuery = async (...args: Parameters<typeof getGameBaseQuery>) => {
//     console.log("Making API call:", args);
//     try {
//         const result = await getGameBaseQuery(...args);
//         "API call result:", result);
//         return result;
//     }
//     catch(ex) {
//         console.error("API fetch error:", ex);
//         throw ex;
//     }
// };

export const gamesApi = createApi({
    reducerPath: "games",
    tagTypes: ['Game'],
    // baseQuery: wrappedGetGameBaseQuery,
    baseQuery: fetchBaseQuery({
        baseUrl: `${Config.api.origin}/api`,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getGame: builder.query<Game, {gameName: GameID;}>({
            query: ({gameName}) => ({
                url: `/games/${gameName}`,
                method: "GET",
            }),
            providesTags: ['Game'],
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
    const response = await fetch(`${Config.api.origin}/api/games`, {
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
        debug(msg);
        throw new Error(msg);
    }
    const result = await response.json();
    return result.gameName;
};
