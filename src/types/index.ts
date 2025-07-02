import { ColorID } from "@root/config";

export type GameID = string;

export type PlayerID = number;

export type UserID = number;

export interface User {
    id: UserID;
    name: {
        display: string;
    };
}

export type UserList = {[userID: UserID]: User};

export interface Player {
    id: PlayerID;
    user?: User;
    color: string;
    sessionID?: never;
}

export interface SelfPlayer extends Player {
    isMe: true;
}

export type BoardPosition = [number, number];

export interface Cell {
    position: BoardPosition;
    color?: ColorID;
}

export interface FilledCell extends Cell {
    color: ColorID;
}

export interface Board {
    width: number;
    height: number;
    filledCells: FilledCell[];
}

export interface PotentialQuintro {
    cells: Cell[];
    color: ColorID;
    numberOfEmptyCells: number;
}

export interface Quintro extends PotentialQuintro {
    cells: FilledCell[];
    numberOfEmptyCells: 0;
}

export interface GameSummary {
    name: GameID;
    playerLimit: number;
    playerCount: number;
    isStarted?: boolean;
    winner?: ColorID;
}

export interface Game {
    name: GameID;
    board: Board;
    players: Player[];
    playerLimit: number;
    createdAtTimestamp: number;
    startedAtTimestamp: number | null;
    endedAtTimestamp: number | null;
    winnerIndex: number | null;
}
