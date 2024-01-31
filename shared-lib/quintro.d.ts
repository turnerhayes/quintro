import { QuintroUser } from "./config";


export interface ServerQuintroUser extends QuintroUser {
    sessionID?: string;
    providerID?: string;
}

export interface PlayerUser extends QuintroUser {
    isMe: boolean;
    isAnonymous: boolean;
}

export interface Player {
	user: PlayerUser;
	color: string;
}

export interface ServerPlayer extends Omit<Player, "user"> {
    user: ServerQuintroUser;
}
