import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import Config from "@app/config";
import {io} from "socket.io-client";

let client: ReturnType<typeof io>|null = null;

const getSocketClient = () => {
    if (client == null) {
        client = io(Config.websockets.url);
    }

    return client;
};

export const GameSocketService = createApi({
    reducerPath: "games",
    baseQuery: fetchBaseQuery({
        baseUrl: Config.websockets.url,
    }),
    endpoints: (builder) => ({
        joinGame: builder.mutation({
            queryFn: ({gameName, colors,}: {gameName: string; colors: string[];}) => {
                const socket = getSocketClient();
                return new Promise((resolve, reject) => {
                    console.log("emitting game:join", gameName);
                    socket.emit(
                        "game:join",
                        {
                            gameName,
                            colors,
                        },
                        () => {
                            console.log("emitted game:join", gameName);
                            resolve({data: {}});
                        }
                    );
                });
            },
        }),
    }),
});

export const { useJoinGameMutation } = GameSocketService;
