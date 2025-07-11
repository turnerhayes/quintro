'use client';

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import createDebugger from "debug";
import Config, { type ColorID } from "@/config";
import type { BoardPosition, GameID, PlayerPresence } from "@/types/index";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/sockets";
import { getStore } from "@/client/redux/store";
import { gamesApi } from "./games";

const debug = createDebugger("quintro:client:socket-client");

const { store } = getStore();

type EmitWithAckWorkaround = <Ev extends keyof ClientToServerEvents>(ev: Ev, ...args: Parameters<ClientToServerEvents[Ev]>) => Promise<any>;

export class SocketClient {
    private readonly socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    private readonly emitWithAck: EmitWithAckWorkaround;

    constructor() {
        this.socket = io(`//${Config.api.host}:${Config.api.port}`, {
            withCredentials: true,
        });

        // The typing of this method doesn't work; see https://github.com/socketio/socket.io/issues/5367
        // Overriding the typing here until this is resolved
        // TODO: Remove this when the issue is fixed
        this.emitWithAck = this.socket.emitWithAck.bind(this.socket) as EmitWithAckWorkaround;

        this.socket.on(
            "connect_error",
            (err) => {
                debug("Connect error event:", err);
            }
        );

        this.socket.on("connect", () => {
            debug("Socket connected");
        });

        this.socket.on(
            "board:marble:placed",
            (
                {
                    gameName,
                    position,
                    color,
                }
            ) => {
                store.dispatch(
                    gamesApi.util.updateQueryData(
                        "getGame",
                        {
                            gameName,
                        },
                        (game) => {
                            const existingCellIndex = game.board.filledCells.findIndex(
                                (cell) => cell.position[0] === position[0] &&
                                    cell.position[1] === position[1]);
                            if (existingCellIndex >= 0) {
                                if (game.board.filledCells[existingCellIndex].color !== color) {
                                    debug("Cell at %s already exists with a different color, updating it", position);
                                    game.board.filledCells[existingCellIndex].color = color;
                                }
                                // If the cell already exists, update its color
                                return game;
                            }
                            game.board.filledCells.push({
                                position,
                                color,
                            });

                            return game;
                        }
                    )
                );
            }
        );

        this.socket.on("game:players:joined", ({
            gameName,
            updatedPlayerList,
        }) => {
            store.dispatch(
                gamesApi.util.updateQueryData(
                    "getGame",
                    {
                        gameName,
                    },
                    (game) => {
                        game.players = updatedPlayerList;

                        return game;
                    }
                )
            );
        });

        this.socket.on("game:started", (
            {
                gameName,
                startedAtTimestamp,
            }
        ) => {
            store.dispatch(
                gamesApi.util.updateQueryData(
                    "getGame",
                    {
                        gameName,
                    },
                    (game) => {
                        game.startedAtTimestamp = startedAtTimestamp;

                        return game;
                    }
                )
            );
        });
        
        this.socket.on("game:over", ({
            gameName,
            winnerIndex,
        }) => {
            store.dispatch(
                gamesApi.util.updateQueryData(
                    "getGame",
                    {
                        gameName,
                    },
                    (game) => {
                        game.winnerIndex = winnerIndex;

                        return game;
                    }
                )
            );
        });
    }

    async joinGame(
        {
            gameName,
            color,
        }: {
            gameName: GameID;
            color: ColorID;
        }
    ) {
        return await this.emitWithAck("game:join", {
            gameName,
            color,
        });

    }

    async establishGameConnection(
        {
            gameName,
        }: {
            gameName: GameID;
        }
    ) {
        return await this.emitWithAck(
            "game:connect",
            {
                gameName,
            }
        );
    }

    async placeMarble(
        {
            gameName,
            position,
            color,
        }: {
            gameName: GameID;
            position: BoardPosition;
            color: ColorID;
        }
    ) {
        try {
            return await this.emitWithAck("board:place-marble", {
                gameName,
                position,
                color,
            });
        }
        catch(ex) {
            debug("Error placing marble:", ex);
            // Remove the marble if the placement failed
            store.dispatch(
                gamesApi.util.updateQueryData(
                    "getGame",
                    {
                        gameName,
                    },
                    (game) => {
                        const index = game.board.filledCells.findIndex(
                            (cell) => cell.position[0] === position[0] &&
                                cell.position[1] === position[1] &&
                                cell.color === color
                        );
    
                        if (index >= 0) {
                            game.board.filledCells.splice(index, 1);
                        }
    
                        return game;
                    }
                )
            );
        }
    }

    async startGame(
        {
            gameName,
        }: {
            gameName: GameID;
        }
    ) {
        return await this.emitWithAck("game:start", {
            gameName,
        });
    }

    async getPlayerPresence(gameName: GameID): Promise<PlayerPresence> {
        const presence = await this.emitWithAck("game:presence:get", {
            gameName,
        });

        debug("Player presence result:", presence);

        return presence;
    }

    listen<E extends keyof ServerToClientEvents>(eventName: E, callback: ServerToClientEvents[E]) {
        // For some reason, the typings of socket.on/once/off don't seem to work correctly; it doesn't
        // like the type of callback, even though it should. Brute-forcing the method type to match is
        // ugly, but seems to be the only way to make it work.
        (this.socket.on as (ev: E, cb: typeof callback) => void)(eventName, callback);
    }

    listenOnce<E extends keyof ServerToClientEvents>(eventName: E, callback: ServerToClientEvents[E]) {
        (this.socket.once as (ev: E, cb: typeof callback) => void)(eventName, callback);
    }

    stopListening<E extends keyof ServerToClientEvents>(eventName: E, callback?: ServerToClientEvents[E]) {
        (this.socket.off as (ev: E, cb: typeof callback) => void)(eventName, callback);
    }
}

export const socketClient = new SocketClient();

export const useSocketEvent = <E extends keyof ServerToClientEvents>(
    eventName: E,
    callback: ServerToClientEvents[E],
    once?: boolean
) => {
    useEffect(() => {
        if (once) {
            socketClient.listenOnce(eventName, callback);
        }
        else {
            socketClient.listen(eventName, callback);
        }

        return () => {
            socketClient.stopListening(eventName, callback);
        }
    }, [
        eventName,
        callback,
        once,
    ]);
};
