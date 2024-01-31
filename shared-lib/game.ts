"use strict";

import { Player, ServerPlayer } from "./quintro.d";
import {Board} from "./board";


export interface Game {
    name: string;
    players: Player[];
    winner: string|null;
    isStarted: boolean;
    playerLimit: number;
    playerPresence: {[color: string]: boolean};
    board: Board;
}

export interface ServerGame extends Omit<Game, "players"> {
    players: ServerPlayer[];
}
