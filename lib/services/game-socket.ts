import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {io} from "socket.io-client";
import Config from "@app/config";
import { useAppDispatch } from "@app/redux/hooks";
import { gameApiSlice } from "./games-service";


interface JoinGameArgs {
    gameName: string;
    colors: string[];
}

let client: ReturnType<typeof io>|null = null;

const getSocketClient = () => {
    if (client == null) {
        client = io(Config.websockets.url, {
            withCredentials: true,
        });
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
            async onQueryStarted({gameName}: JoinGameArgs, api) {
                const {
                    data: {players},
                } = await api.queryFulfilled;
                api.dispatch(
                    gameApiSlice.util.updateQueryData(
                        "getGames",
                        {
                            gameName,
                        },
                        (draft: Game[]) => {
                            const game = draft.find((game) => game.name === gameName);
                            if (!game) {
                                throw new Error(`Could not find game with name ${gameName}`);
                            }
                            game.players.push(players);
                        }
                    )
                    // addPlayers({
                    //     gameName,
                    //     players,
                    // })
                );
                api.dispatch(
                    setPlayerPresence({
                        gameName,
                        presenceMap: players.reduce(
                            (map, player) => {
                                map[player.color] = true;
    
                                return map;
                            },
                            {}
                        ),
                    })
                );
            },
            queryFn: ({gameName, colors,}: JoinGameArgs) => {
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

        watchGame: builder.mutation({
            queryFn({gameName}: {gameName: string;}) {
                const socket = getSocketClient();
                return new Promise((resolve, reject) => {
                    socket.emit(
                        "game:watch",
                        {
                            gameName,
                        },
                        () => {
                            resolve({data: {}});
                        }
                    );
                });
            },
        }),
    }),
});

export const { useJoinGameMutation, useWatchGameMutation } = GameSocketService;
