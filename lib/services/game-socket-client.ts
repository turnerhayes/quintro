import {Socket, io} from "socket.io-client";
import Config from "@app/config";
import { gameApiSlice } from "@lib/services/games-service";
import { Player } from "@shared/quintro.d";


export const enum EventName {
    JOIN_GAME = "game:join",
    WATCH_GAME = "game:watch",
    PLAYERS_JOINED = "game:players:joined",
}

type EventToArgsDataTypeMapping = {
    [EventName.JOIN_GAME]: {
        gameName: string;
        colors: string[];
    },
    [EventName.WATCH_GAME]: {
        gameName: string;
    },
    [EventName.PLAYERS_JOINED]: void;
}

type EventToReturnDataTypeMapping = {
    [EventName.JOIN_GAME]: {
        gameName: string;
        players: unknown[];
    },
    [EventName.WATCH_GAME]: void,
    [EventName.PLAYERS_JOINED]: {
        players: unknown[];
    }
}

export type ListenerCallback<T extends EventName> = (error: ErrorResponse|null, data?: EventToReturnDataTypeMapping[T]) => void;

export interface ErrorResponse {
    message: string;
    code: string;
}

interface InternalErrorResponse extends ErrorResponse {
    error: true;
}

class GameSocketClient {
    private readonly client: Socket;

    private listeners: {[eventName in EventName]: ListenerCallback<EventName>[]};

    constructor() {
        this.client = io(Config.websockets.url, {
            withCredentials: true,
        });
        this.addListeners();
    }

    private handlePlayersJoined(gameName: string, players: Player[]) {
        this.triggerListeners(EventName.PLAYERS_JOINED, null, {players});
        gameApiSlice.util.updateQueryData("getGames", {
            gameName,
        },
        (draft) => {
            const game = draft.find((game) => game.name === gameName);
            if (!game) {
                throw new Error(`Unable to find game ${gameName} in cache`);
            }

            game.players.push(...players);
        });
    }

    private addListeners() {
        this.client.on(EventName.PLAYERS_JOINED, ({
            gameName,
            players,
        }: {
            gameName: string;
            players: Player[];
        }) => {
            this.handlePlayersJoined(gameName, players);
        });
    }

    async joinGame(gameName: string, colors: string[]) {
        this.emitEvent(
            EventName.JOIN_GAME,
            {
                gameName,
                colors,
            }
        );
    }

    async watchGame(gameName: string) {
        return this.emitEvent(EventName.WATCH_GAME, {gameName});
    }

    private emitEvent<E extends EventName>(
        event: E,
        args: EventToArgsDataTypeMapping[E]
    ): Promise<EventToReturnDataTypeMapping[E]|ErrorResponse> {
        return new Promise((resolve, reject) => {
            this.client.emit(
                event,
                args,
                (response: InternalErrorResponse | EventToReturnDataTypeMapping[E]) => {
                    if (
                        typeof response === "object" &&
                        "error" in response &&
                        response.error === true
                    ) {
                        const {message, code} = response;
                        reject({
                            message,
                            code,
                        });
                        this.triggerListeners(event, response, null);
                        return;
                    }
                    this.triggerListeners(
                        event,
                        null,
                        response as EventToReturnDataTypeMapping[E]
                    );
                    resolve(response);
                }
            )
        })
    }

    listen<E extends EventName>(eventName: E, handler: ListenerCallback<E>) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(handler);
    }

    stopListening<E extends EventName>(eventName: E, handler: ListenerCallback<E>) {
        if (!this.listeners[eventName]) {
            return;
        }
        const index = this.listeners[eventName].findIndex((h) => h === handler);
        if (index < 0) {
            return;
        }
        this.listeners[eventName].splice(index, 1);
    }

    private triggerListeners<E extends EventName>(
        eventName: E,
        error: ErrorResponse|null,
        data: EventToReturnDataTypeMapping[E]
    ) {
        const handlers = this.listeners[eventName];
        if (handlers && handlers.length > 0) {
            handlers.map((handler) => handler(error, data));
        }
    }
}

export default GameSocketClient;

export const clientInstance = new GameSocketClient();
