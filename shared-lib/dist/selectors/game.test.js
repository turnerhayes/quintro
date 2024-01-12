"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const board_1 = __importDefault(require("@shared-lib/board"));
const utils_1 = require("../__test__/utils");
const game_1 = require("./game");
describe("shared-lib", () => {
    describe("game selectors", () => {
        describe("getCurrentPlayerColor", () => {
            it("should return the next player color in the sequence", () => {
                const players = [
                    {
                        id: "1",
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        id: "2",
                        color: utils_1.DEFAULT_COLORS[1],
                    },
                    {
                        id: "3",
                        color: utils_1.DEFAULT_COLORS[2],
                    },
                ];
                const game = (0, immutable_1.fromJS)({
                    board: new board_1.default({
                        width: 10,
                        height: 10,
                        filledCells: [
                            {
                                position: [0, 0],
                                color: utils_1.DEFAULT_COLORS[0],
                            },
                            {
                                position: [1, 1],
                                color: utils_1.DEFAULT_COLORS[1],
                            },
                        ],
                    }),
                    playerLimit: 3,
                    players,
                    isStarted: true,
                });
                expect((0, game_1.getCurrentPlayerColor)(game)).toBe(utils_1.DEFAULT_COLORS[2]);
            });
            it("should wrap around at the end of the player sequence", () => {
                const players = [
                    {
                        id: "1",
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        id: "2",
                        color: utils_1.DEFAULT_COLORS[1],
                    },
                    {
                        id: "3",
                        color: utils_1.DEFAULT_COLORS[2],
                    },
                ];
                const game = (0, immutable_1.fromJS)({
                    board: new board_1.default({
                        width: 10,
                        height: 10,
                        filledCells: [
                            {
                                position: [0, 0],
                                color: utils_1.DEFAULT_COLORS[0],
                            },
                            {
                                position: [1, 1],
                                color: utils_1.DEFAULT_COLORS[1],
                            },
                            {
                                position: [0, 1],
                                color: utils_1.DEFAULT_COLORS[2],
                            },
                        ],
                    }),
                    playerLimit: 3,
                    players,
                    isStarted: true,
                });
                expect((0, game_1.getCurrentPlayerColor)(game)).toBe(utils_1.DEFAULT_COLORS[0]);
            });
            it("should return undefined if the game has not started", () => {
                const players = [
                    {
                        id: "1",
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const game = (0, immutable_1.fromJS)({
                    board: new board_1.default({
                        width: 10,
                        height: 10,
                        filledCells: [],
                    }),
                    playerLimit: 3,
                    players,
                    isStarted: false,
                });
                expect((0, game_1.getCurrentPlayerColor)(game)).toBeUndefined();
            });
            it("should return the first player's color if the game is started but no move has been made", () => {
                const players = [
                    {
                        id: "1",
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        id: "2",
                        color: utils_1.DEFAULT_COLORS[1],
                    },
                    {
                        id: "3",
                        color: utils_1.DEFAULT_COLORS[2],
                    },
                ];
                const game = (0, immutable_1.fromJS)({
                    board: new board_1.default({
                        width: 10,
                        height: 10,
                        filledCells: [],
                    }),
                    playerLimit: 3,
                    players,
                    isStarted: true,
                });
                expect((0, game_1.getCurrentPlayerColor)(game)).toBe(utils_1.DEFAULT_COLORS[0]);
            });
        });
    });
});
