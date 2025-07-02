import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Config, { ColorID } from "@root/config";
import { BoardPosition, GameID } from "@root/types/index";
import { ServerToClientEvents, ClientToServerEvents } from "@root/types/sockets";
import { store } from "@/redux/store";
import { gamesApi } from "./games";
import { EventNames } from "socket.io/dist/typed-events";
import { FallbackToUntypedListener } from "@socket.io/component-emitter";


type EmitWithAckWorkaround = <Ev extends keyof ClientToServerEvents>(ev: Ev, ...args: Parameters<ClientToServerEvents[Ev]>) => Promise<any>;

export class SocketClient {
    private readonly socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    private readonly emitWithAck: EmitWithAckWorkaround;

    constructor() {
        this.socket = io(`//${window.location.hostname}:${Config.websockets.port}`, {
            withCredentials: true,
        });

        this.emitWithAck = this.socket.emitWithAck.bind(this.socket) as EmitWithAckWorkaround;

        this.socket.on(
            "connect_error",
            (err) => {
                console.log("[SocketClient] Connect error event:", err);
            }
        );

        this.socket.on(
            "board:marble:placed",
            (
                {
                    gameName,
                    position,
                    color,
                }: {
                    gameName: GameID;
                    position: BoardPosition;
                    color: ColorID;
                }
            ) => {
                store.dispatch(
                    gamesApi.util.updateQueryData(
                        "getGame",
                        {
                            gameName,
                        },
                        (game) => {
                            game.board.filledCells.push({
                                position,
                                color,
                            });
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
        const result = await this.emitWithAck("game:join", {
            gameName,
            color,
        });

        if (result.error) {
            throw new Error(result.message);
        }
    }

    async establishGameConnection(
        {
            gameName,
        }: {
            gameName: GameID;
        }
    ) {
        const result = await this.emitWithAck(
            "game:connect",
            {
                gameName,
            }
        );

        if (result.error) {
            throw new Error(result.message);
        }

        return result;
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
        const result = await this.emitWithAck("board:place-marble", {
            gameName,
            position,
            color,
        });

        if (result.error) {
            throw new Error(result.message);
        }

        return result;
    }

    listen<E extends keyof ServerToClientEvents>(eventName: E, callback: ServerToClientEvents[E]) {
        // For some reason, the typings of socket.on/once/off don't seem to work correctly; it doesn't
        // like the type of callback, even though it should. Brute-forcing the method type to match is
        // ugly, but seems to be the only way to make it work.
        (this.socket.on as (ev: E, cb: typeof callback) => void)(eventName, callback);
    }

    listenOnce<E extends EventNames<ServerToClientEvents>>(eventName: E, callback: ServerToClientEvents[E]) {
        (this.socket.once as (ev: E, cb: typeof callback) => void)(eventName, callback);
    }

    stopListening<E extends EventNames<ServerToClientEvents>>(eventName: E, callback?: ServerToClientEvents[E]) {
        (this.socket.off as (ev: E, cb: typeof callback) => void)(eventName, callback);
    }
}

export const socketClient = new SocketClient();

export const useSocketEvent = <E extends EventNames<ServerToClientEvents>>(
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
