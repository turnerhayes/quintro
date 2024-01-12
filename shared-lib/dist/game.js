"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const board_1 = __importDefault(require("./board"));
const schema = {
    name: "",
    board: new board_1.default({
        width: 10,
        height: 10,
    }),
    players: (0, immutable_1.List)(),
    winner: null,
    isStarted: false,
    playerLimit: 3,
    playerPresence: (0, immutable_1.Map)()
};
class ImmutableGame extends (0, immutable_1.Record)(schema, "Game") {
    constructor({ name, players = (0, immutable_1.List)(), winner = null, playerLimit = 3, }) {
        super({
            name,
            players,
            winner,
            playerLimit,
        });
    }
    get name() {
        return this.get("name");
    }
    set name(value) {
        this.set("name", value);
    }
    get players() {
        return this.get("players");
    }
    get winner() {
        return this.get("winner");
    }
    set winner(value) {
        this.set("winner", value);
    }
    get isStarted() {
        return this.get("isStarted");
    }
    set isStarted(started) {
        this.set("isStarted", started);
    }
    get playerLimit() {
        return this.get("playerLimit");
    }
    set playerLimit(limit) {
        this.set("playerLimit", limit);
    }
}
exports.default = ImmutableGame;
