import { Session, SessionData } from "express-session";
import { Player, Game, User } from "@/types/index";

declare module 'http' {
    interface IncomingMessage {
        cookieHolder?: string;
        session: Session & Partial<SessionData>;
        user?: User;
    }
}

export type ServerPlayer = Omit<Player, "sessionID"> & {
    sessionID: string;
};

export type ServerGame = Omit<Game, "players"> & {
    players: ServerPlayer[];
};
