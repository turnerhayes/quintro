import {Map, List, Record} from "immutable";


export interface Player {
	userID: number;
	color: string;
}

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

export type ImmutablePlayerUser = Record<PlayerUser>;

export type ImmutablePlayer = Record<Player>;