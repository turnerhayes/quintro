import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {api as APIConfig} from "@shared/config";
import { Game } from "@shared/game";

export const gameApiSlice = createApi({
    reducerPath: "games",
    baseQuery: fetchBaseQuery({baseUrl: APIConfig.root}),
    endpoints: (builder) => ({
        getGames: builder.query<Game[], {gameName?: string}>({
            query: ({gameName}) => {
                let url = "/games";

                if (gameName) {
                    url += `/${gameName}`;
                }

                return url;
            },
            transformResponse(games: Game|Game[]) {
                if (!Array.isArray(games)) {
                    games = [games];
                }

                for (const game of games) {
                    if (!game.playerPresence) {
                        game.playerPresence = {};
                    }
                }

                return games;
            }
        }),

        findOpenGames: builder.query<Game[], number|null>({
            query: (numberOfPlayers?: number) => {
                const searchParams: {
                    onlyOpenGames: "true";
                    numberOfPlayers?: string;
                } = {
                    onlyOpenGames: "true",
                };
                if (numberOfPlayers != null) {
                    searchParams.numberOfPlayers = `${numberOfPlayers}`;
                }
                return `/games?${new URLSearchParams(searchParams)}`;
            },
        }),
    }),
});

export const {useGetGamesQuery, useFindOpenGamesQuery} = gameApiSlice;
