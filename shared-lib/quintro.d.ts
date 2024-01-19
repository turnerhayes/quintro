import {Map, List, Record} from "immutable";

export interface PlayerUser {
    id: string;
    isMe: boolean;
    isAnonymous: boolean;
    username: string;
    name: {
        display: string;
    };
    color: string;
}

export interface Player {
	user: PlayerUser;
	color: string;
}

export type ImmutablePlayerUser = Record<PlayerUser>;

export type ImmutablePlayer = Record<Player>;