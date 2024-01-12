import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {api as APIConfig} from "@shared/config";

export const gameApiSlice = createApi({
    reducerPath: "games",
    baseQuery: fetchBaseQuery({baseUrl: APIConfig.root}),
    endpoints: (builder) => ({
        getGames: builder.query({
            query: () => "/games",
        }),

        getGame: builder.query({
            query: (gameName: string) => `/games/${gameName}`,
        }),
    }),
});

export const {useGetGamesQuery, useGetGameQuery} = gameApiSlice;
