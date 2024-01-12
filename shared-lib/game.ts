"use strict";

import { List, Map, Record } from "immutable";
import { Player } from "./quintro.d";
import ImmutableBoard, {Board} from "./board";


export interface Game {
    name: string;
    players: Player[];
    winner: string|null;
    isStarted: boolean;
    playerLimit: number;
    playerPresence: {[color: string]: boolean};
    board: Board;
}

type ImmutableGameRecordSchema = Omit<Game, "players" | "playerPresence" | "board"> & {
    players: List<Player>;
    playerPresence: Map<string, boolean>;
    board: ImmutableBoard;
};

const schema: ImmutableGameRecordSchema = {
    name: "",
    board: new ImmutableBoard({
        width: 10,
        height: 10,
    }),
    players: List(),
    winner: null,
    isStarted: false,
    playerLimit: 3,
    playerPresence: Map<string, boolean>()
};

export type GameConstructorArgs = Partial<Pick<ImmutableGameRecordSchema, 'name' | 'players' | 'winner' | 'playerLimit'>>;

class ImmutableGame extends Record(schema, "Game") {
    constructor({
        name,
        players = List(),
        winner = null,
        playerLimit = 3,
    }: GameConstructorArgs) {
        super({
            name,
            players,
            winner,
            playerLimit,
        });
    }

    get name(): string {
        return this.get("name");
    }

    set name(value: string) {
        this.set("name", value);
    }

    get players(): List<Player> {
        return this.get("players");
    }

    get winner(): string {
        return this.get("winner");
    }

    set winner(value: string) {
        this.set("winner", value);
    }

    get isStarted(): boolean {
        return this.get("isStarted");
    }

    set isStarted(started: boolean) {
        this.set("isStarted", started);
    }

    get playerLimit(): number {
        return this.get("playerLimit");
    }

    set playerLimit(limit: number) {
        this.set("playerLimit", limit);
    }
}

export default ImmutableGame;
