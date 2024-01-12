"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const immutable_1 = require("immutable");
const immutableMatchers = __importStar(require("jest-immutable-matchers"));
const board_1 = __importDefault(require("./board"));
const utils_1 = require("./__test__/utils");
beforeAll(() => {
    jest.addMatchers(immutableMatchers);
});
describe("shared-lib", () => {
    describe("Board", () => {
        describe("constructor", () => {
            it("should throw an assertion error if width is undefined", () => {
                expect(() => new board_1.default({
                    height: 5,
                })).toThrow(assert_1.default.AssertionError);
            });
            it("should throw an assertion error if width is less than 0", () => {
                expect(() => new board_1.default({
                    width: -2
                })).toThrow(assert_1.default.AssertionError);
            });
            it("should throw an assertion error if width is not an integer", () => {
                expect(() => new board_1.default({
                    width: 5.6
                })).toThrow(assert_1.default.AssertionError);
            });
            it("should throw an assertion error if height is undefined", () => {
                expect(() => new board_1.default({
                    width: 5
                })).toThrow(assert_1.default.AssertionError);
            });
            it("should throw an assertion error if height is less than 0", () => {
                expect(() => new board_1.default({
                    height: -2
                })).toThrow(assert_1.default.AssertionError);
            });
            it("should throw an assertion error if height is not an integer", () => {
                expect(() => new board_1.default({
                    height: 5.6
                })).toThrow(assert_1.default.AssertionError);
            });
            it("should throw an assertion error if filledCells is not an array", () => {
                expect(() => new board_1.default({
                    width: 5,
                    height: 5,
                    filledCells: "not proper"
                })).toThrow(assert_1.default.AssertionError);
            });
            it("should not throw an error if all parameters are valid", () => {
                expect(() => new board_1.default({
                    width: 5,
                    height: 5,
                    filledCells: []
                })).not.toThrow();
            });
        });
        describe("getCell", () => {
            const board = new board_1.default({
                width: 10,
                height: 10,
                filledCells: [
                    {
                        position: [1, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ],
            });
            it("should throw an assertion error if passed a negative column or row index", () => {
                expect(
                // eslint-disable-next-line no-magic-numbers
                () => board.getCell([-1, 2])).toThrow(assert_1.default.AssertionError);
                expect(
                // eslint-disable-next-line no-magic-numbers
                () => board.getCell([1, -2])).toThrow(assert_1.default.AssertionError);
            });
            it("should throw an assertion error if passed a column or row index outside the board bounds", () => {
                expect(
                // eslint-disable-next-line no-magic-numbers
                () => board.getCell([20, 1])).toThrow(assert_1.default.AssertionError);
                expect(
                // eslint-disable-next-line no-magic-numbers
                () => board.getCell([1, 20])).toThrow(assert_1.default.AssertionError);
            });
            it("should return a Map with `position` and `color` properties", () => {
                const cell = board.getCell([1, 1]);
                expect(cell.has("position")).toBeTruthy();
                expect(cell.has("color")).toBeTruthy();
                expect(cell.get("color")).toBe(utils_1.DEFAULT_COLORS[0], "cell color is correct");
            });
        });
        describe("getPlayerColors", () => {
            it("should return colors in the order of cells filled", () => {
                const board = new board_1.default({
                    width: 20,
                    height: 20,
                    filledCells: [
                        /* eslint-disable no-magic-numbers */
                        {
                            position: [2, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [4, 4],
                            color: utils_1.DEFAULT_COLORS[2],
                        },
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[4],
                        },
                        /* eslint-enable no-magic-numbers */
                    ],
                });
                expect(board.getPlayerColors()).toEqualImmutable((0, immutable_1.List)([
                    utils_1.DEFAULT_COLORS[0],
                    utils_1.DEFAULT_COLORS[2],
                    utils_1.DEFAULT_COLORS[4],
                ]));
            });
            it("should not return duplicate colors", () => {
                const board = new board_1.default({
                    width: 20,
                    height: 20,
                    filledCells: [
                        /* eslint-disable no-magic-numbers */
                        {
                            position: [2, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [4, 4],
                            color: utils_1.DEFAULT_COLORS[2],
                        },
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[4],
                        },
                        {
                            position: [10, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        /* eslint-enable no-magic-numbers */
                    ],
                });
                expect(board.getPlayerColors()).toEqualImmutable((0, immutable_1.List)([
                    utils_1.DEFAULT_COLORS[0],
                    utils_1.DEFAULT_COLORS[2],
                    utils_1.DEFAULT_COLORS[4],
                ]));
            });
            it("should return an empty List if no cells have been filled", () => {
                const board = new board_1.default({
                    width: 20,
                    height: 20,
                    filledCells: [],
                });
                expect(board.getPlayerColors()).toEqualImmutable((0, immutable_1.List)());
            });
        });
        describe("toString", () => {
            it("should return a string representation of the board", () => {
                const width = 20;
                const height = 15;
                const board = new board_1.default({
                    width,
                    height,
                    filledCells: [
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [1, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [10, 2],
                            color: utils_1.DEFAULT_COLORS[1],
                        },
                    ],
                });
                expect(board.toString()).toBe(`Board<${width}x${height}, filledCells: 1,2:${utils_1.DEFAULT_COLORS[0]}; 10,2:${utils_1.DEFAULT_COLORS[1]}>`);
            });
            it("should not include a summary of filled cells if there are no filled cells", () => {
                const width = 20;
                const height = 15;
                const board = new board_1.default({
                    width,
                    height,
                    filledCells: [],
                });
                expect(board.toString()).toBe(`Board<${width}x${height}>`);
            });
        });
        describe("toGraphicalString", () => {
            it("should return a string representation of the board in grid format", () => {
                const width = 10;
                const height = 10;
                const board = new board_1.default({
                    width,
                    height,
                    filledCells: [
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [1, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [9, 2],
                            color: utils_1.DEFAULT_COLORS[1],
                        },
                    ],
                });
                const expected = `0: ${utils_1.DEFAULT_COLORS[0]}
1: ${utils_1.DEFAULT_COLORS[1]}

 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  0  -  -  -  -  -  -  -  1
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
`;
                expect(board.toGraphicalString()).toBe(expected);
            });
            it("should mark the start cell if specified", () => {
                const width = 10;
                const height = 10;
                const startCell = {
                    // eslint-disable-next-line no-magic-numbers
                    position: [9, 2],
                    color: utils_1.DEFAULT_COLORS[1],
                };
                const board = new board_1.default({
                    width,
                    height,
                    filledCells: [
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [1, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        startCell,
                    ],
                });
                const expected = `0: ${utils_1.DEFAULT_COLORS[0]}
1: ${utils_1.DEFAULT_COLORS[1]}

 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  0  -  -  -  -  -  -  - ^1
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
`;
                expect(board.toGraphicalString({
                    // eslint-disable-next-line no-magic-numbers
                    startCell,
                })).toBe(expected);
            });
            it("should respect the passed in player colors if specified", () => {
                const width = 10;
                const height = 10;
                const player1color = "taupe";
                const player2color = "magenta";
                const board = new board_1.default({
                    width,
                    height,
                    filledCells: [
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [1, 2],
                            color: player1color,
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [9, 2],
                            color: player2color,
                        },
                    ],
                });
                const expected = `0: ${player1color}
1: ${player2color}

 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  0  -  -  -  -  -  -  -  1
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
`;
                expect(board.toGraphicalString({
                    playerColors: [
                        player1color,
                        player2color,
                    ],
                })).toBe(expected);
            });
            it("should not include the legend if there are no filled cells", () => {
                const width = 10;
                const height = 10;
                const board = new board_1.default({
                    width,
                    height,
                });
                const expected = ` -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
 -  -  -  -  -  -  -  -  -  -
`;
                expect(board.toGraphicalString()).toBe(expected);
            });
        });
        describe("fillCells", () => {
            it("should append the new cells to the filledCells in the order passed", () => {
                const width = 10;
                const height = 10;
                const filledCells = [
                    {
                        position: [0, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [9, 9],
                        color: utils_1.DEFAULT_COLORS[1],
                    },
                ];
                let board = new board_1.default({
                    width,
                    height,
                    filledCells,
                });
                expect(board.get("filledCells")).toEqualImmutable((0, immutable_1.fromJS)(filledCells));
                const additionalCells = [
                    {
                        position: [1, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [9, 8],
                        color: utils_1.DEFAULT_COLORS[1],
                    },
                ];
                filledCells.push(...additionalCells);
                board = board.fillCells(...additionalCells);
                expect(board.get("filledCells")).toEqualImmutable((0, immutable_1.fromJS)(filledCells));
            });
        });
    });
});
