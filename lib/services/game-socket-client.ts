import {Socket, io} from "socket.io-client";
import Config from "@app/config";
import { gameApiSlice } from "@lib/services/games-service";
import { Player } from "@shared/quintro.d";


export enum EventName {
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
        gameName: string;
        players: unknown[];
    }
}

export type ListenableEvent = keyof EventToReturnDataTypeMapping;

type TriggerListenersArgs<E extends ListenableEvent> = {
    eventName: E;
    error: null;
    data: EventToReturnDataTypeMapping[E];
} | {
    eventName: E;
    error: ErrorResponse;
    data: null;
};

export type ListenerCallback<T extends EventName> = (
    error: ErrorResponse|null,
    data?: EventToReturnDataTypeMapping[T]|null
) => void;

export interface ErrorResponse {
    message: string;
    code: string;
}

interface InternalErrorResponse extends ErrorResponse {
    error: true;
}

class GameSocketClient {
    private readonly client: Socket;

    private static _instance: GameSocketClient;

    private readonly listeners: {[event in ListenableEvent]: ListenerCallback<ListenableEvent>[]} = {
        [EventName.JOIN_GAME]: [] as ListenerCallback<typeof EventName.JOIN_GAME>[],
        [EventName.PLAYERS_JOINED]: [] as ListenerCallback<typeof EventName.PLAYERS_JOINED>[],
        [EventName.WATCH_GAME]: [] as ListenerCallback<typeof EventName.WATCH_GAME>[],
    };

    constructor() {
        // const url = Config.websockets.url;
        const url = "/";

        this.client = io(url, {
            withCredentials: true,
            path: "/pages-api/socket",
        });
        this.addListeners();
    }

    static get instance() {
        if (!GameSocketClient._instance) {
            GameSocketClient._instance = new GameSocketClient();
        }

        return GameSocketClient._instance;
    }

    private handlePlayersJoined(gameName: string, players: Player[]) {
        this.triggerListeners({
            eventName: EventName.PLAYERS_JOINED,
            error: null,
            data: {players, gameName},
        });
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
            console.info("Socket client emitting event ", event);
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
                        this.triggerListeners({
                            eventName: event,
                            error: {
                                message: response.message,
                                code: response.code,
                            } as ErrorResponse,
                            data: null,
                        });
                        return;
                    }
                    this.triggerListeners({
                        eventName: event,
                        error: null,
                        data: response as EventToReturnDataTypeMapping[E]
                    });
                    resolve(response);
                }
            )
        })
    }

    listen<E extends ListenableEvent>(eventName: E, handler: ListenerCallback<E>) {
        this.listeners[eventName].push(handler);
    }

    stopListening<E extends ListenableEvent>(eventName: E, handler: ListenerCallback<E>) {
        if (!this.listeners[eventName]) {
            return;
        }
        const index = this.listeners[eventName].findIndex((h) => h === handler);
        if (index < 0) {
            return;
        }
        this.listeners[eventName].splice(index, 1);
    }

    private triggerListeners<E extends ListenableEvent>({
        eventName,
        error,
        data,
    }: TriggerListenersArgs<E>) {
        const handlers = this.listeners[eventName];
        for (const handler of handlers) {
            handler(error, data);
        }
    }
}

export {GameSocketClient};
