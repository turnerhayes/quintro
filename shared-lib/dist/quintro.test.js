"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const quintro_1 = __importDefault(require("./quintro"));
const utils_1 = require("./__test__/utils");
describe("shared-lib", () => {
    describe("Quintro", () => {
        describe("constructor", () => {
            it("should determine the quintro's color from the cells", () => {
                const quintro = new quintro_1.default({
                    cells: [
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 1],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                    ],
                });
                expect(quintro.get("color")).toBe(utils_1.DEFAULT_COLORS[0]);
                expect(quintro.get("numberOfEmptyCells")).toBe(0);
            });
            it("should construct an incomplete Quintro", () => {
                const quintro = new quintro_1.default({
                    cells: [
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 1],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                        },
                    ],
                });
                expect(quintro.get("color")).toBe(utils_1.DEFAULT_COLORS[0]);
                // eslint-disable-next-line no-magic-numbers
                expect(quintro.get("numberOfEmptyCells")).toBe(2);
            });
            it("should throw an error if there are no filled cells", () => {
                expect(() => new quintro_1.default({
                    cells: [
                        {
                            position: [0, 0],
                        },
                        {
                            position: [0, 1],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                        },
                    ],
                })).toThrow("Cannot create a quintro with only empty cells");
            });
            it("should throw an error if there are more than one colors among the cells", () => {
                expect(() => new quintro_1.default({
                    cells: [
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 1],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                            color: utils_1.DEFAULT_COLORS[1],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                    ],
                })).toThrow("A quintro may only contain filled cells of one color; found at least two colors");
            });
        });
        describe("serialize", () => {
            it("should return a serialized representation of the Quintro", () => {
                const cells = [
                    {
                        position: [0, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        position: [0, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 2],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 3],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 4],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const quintro = new quintro_1.default({
                    cells,
                });
                expect(quintro.serialize()).toBe(cells.map(JSON.stringify).join(";"));
            });
            it("should return a serialized representation an incomplete Quintro", () => {
                const cells = [
                    {
                        position: [0, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        position: [0, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 2],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 3],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 4],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const quintro = new quintro_1.default({
                    cells,
                });
                expect(quintro.serialize()).toBe(cells.map(JSON.stringify).join(";"));
            });
        });
        describe("toString", () => {
            it("should return a string representation of the Quintro", () => {
                const cells = [
                    {
                        position: [0, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        position: [0, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 2],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 3],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 4],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const quintro = new quintro_1.default({
                    cells,
                });
                expect(quintro.toString()).toBe(`Quintro<${cells.map(JSON.stringify).join(";")}>`);
            });
            it("should return a string representation of an incomplete Quintro", () => {
                const cells = [
                    {
                        position: [0, 0],
                    },
                    {
                        position: [0, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 2],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 3],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 4],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const quintro = new quintro_1.default({
                    cells,
                });
                expect(quintro.toString()).toBe(`Quintro<${cells.map(JSON.stringify).join(";")}>`);
            });
        });
        describe("equals", () => {
            it("should consider two different Quintro objects equal when they contain the same cell definitions", () => {
                const args = {
                    cells: [
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 1],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                    ],
                };
                expect(new quintro_1.default(args).equals(new quintro_1.default(args))).toBeTruthy();
            });
            it("should consider a Quintro object equal to itself", () => {
                const quintro = new quintro_1.default({
                    cells: [
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 1],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                    ],
                });
                expect(quintro.equals(quintro)).toBeTruthy();
            });
            it("should consider two different Quintro objects to be unequal", () => {
                const cells = [
                    {
                        position: [0, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        position: [0, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 2],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 3],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 4],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const quintro = new quintro_1.default({
                    cells,
                });
                const quintro2 = new quintro_1.default({
                    cells: cells.concat([
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 5],
                            color: utils_1.DEFAULT_COLORS[0],
                        }
                    ]),
                });
                expect(quintro.equals(quintro2)).toBeFalsy();
            });
            it("should consider a non-Quintro object to be unequal to a Quintro object", () => {
                const quintro = new quintro_1.default({
                    cells: [
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 1],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                    ],
                });
                expect(quintro.equals({})).toBeFalsy();
            });
        });
        describe("hashCode", () => {
            it("should return the same value for equivalent Quintros", () => {
                const args = {
                    cells: [
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 1],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                    ],
                };
                expect(new quintro_1.default(args).hashCode()).toBe(new quintro_1.default(args).hashCode());
            });
        });
        describe("containsCell", () => {
            it("should return true if the Quintro contains the cell", () => {
                const quintro = new quintro_1.default({
                    cells: [
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 1],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                    ],
                });
                // eslint-disable-next-line no-magic-numbers
                expect(quintro.containsCell({ position: [0, 3] })).toBeTruthy();
            });
            it("should return false if the Quintro does not contain the cell", () => {
                const quintro = new quintro_1.default({
                    cells: [
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 1],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                    ],
                });
                // eslint-disable-next-line no-magic-numbers
                expect(quintro.containsCell({ position: [10, 13] })).toBeFalsy();
            });
        });
        describe("cellsAreInSamePositions", () => {
            it("should return true for equivalent Quintros", () => {
                const args = {
                    cells: [
                        {
                            position: [0, 0],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            position: [0, 1],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 2],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 3],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                        {
                            // eslint-disable-next-line no-magic-numbers
                            position: [0, 4],
                            color: utils_1.DEFAULT_COLORS[0],
                        },
                    ],
                };
                expect(new quintro_1.default(args).cellsAreInSamePositions(new quintro_1.default(args))).toBeTruthy();
            });
            it("should return true for Quintros that differ in colors", () => {
                const cells = [
                    {
                        position: [0, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        position: [0, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 2],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 3],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 4],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const quintro1 = new quintro_1.default({ cells });
                const quintro2 = new quintro_1.default({
                    cells: cells.map((cell) => ({
                        ...cell,
                        color: utils_1.DEFAULT_COLORS[1],
                    }))
                });
                expect(quintro1.cellsAreInSamePositions(quintro2)).toBeTruthy();
            });
            it("should return true if one Quintro is missing a color for one or more cells", () => {
                const cells = [
                    {
                        position: [0, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        position: [0, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 2],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 3],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 4],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const quintro1 = new quintro_1.default({ cells });
                delete cells[0].color;
                const quintro2 = new quintro_1.default({ cells });
                expect(quintro1.cellsAreInSamePositions(quintro2)).toBeTruthy();
            });
            it("should return false if one Quintro contains fewer cells", () => {
                const cells = [
                    {
                        position: [0, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        position: [0, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 2],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 3],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 4],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 5],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const quintro1 = new quintro_1.default({ cells });
                const quintro2 = new quintro_1.default({
                    cells: cells.slice(1),
                });
                expect(quintro1.cellsAreInSamePositions(quintro2)).toBeFalsy();
            });
            it("should return false if the Quintros contain different cells", () => {
                const cells = [
                    {
                        position: [0, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        position: [0, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 2],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 3],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 4],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const quintro1 = new quintro_1.default({ cells });
                // eslint-disable-next-line no-magic-numbers
                cells[cells.length - 1].position = [0, 5];
                const quintro2 = new quintro_1.default({ cells });
                expect(quintro1.cellsAreInSamePositions(quintro2)).toBeFalsy();
            });
            it("should return false if the argument is not a Quintro object", () => {
                const cells = [
                    {
                        position: [0, 0],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        position: [0, 1],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 2],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 3],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                    {
                        // eslint-disable-next-line no-magic-numbers
                        position: [0, 4],
                        color: utils_1.DEFAULT_COLORS[0],
                    },
                ];
                const quintro1 = new quintro_1.default({ cells });
                expect(quintro1.cellsAreInSamePositions({})).toBeFalsy();
            });
        });
    });
});
