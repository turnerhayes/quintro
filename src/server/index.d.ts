import { Session, SessionData } from "express-session";
import { Player, Game } from "@root/types/index";

declare module 'http' {
    interface IncomingMessage {
        cookieHolder?: string;
        session: Session & Partial<SessionData>;
    }
}

export interface ServerPlayer extends Player {
    sessionID: string;
}

export interface ServerGame extends Game {
    players: ServerPlayer[];
}
