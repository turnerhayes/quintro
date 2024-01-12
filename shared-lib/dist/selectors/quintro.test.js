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
const immutable_1 = require("immutable");
const immutableMatchers = __importStar(require("jest-immutable-matchers"));
const utils_1 = require("../__test__/utils");
const potential_quintros_board_layouts_1 = __importDefault(require("../__test__/quintro/potential-quintros-board-layouts"));
const all_potential_quintros_board_layouts_1 = __importDefault(require("../__test__/quintro/all-potential-quintros-board-layouts"));
const quintro_board_layouts_1 = __importDefault(require("../__test__/quintro/quintro-board-layouts"));
const quintro_delta_board_layouts_1 = __importDefault(require("../__test__/quintro/quintro-delta-board-layouts"));
const board_1 = __importDefault(require("../board"));
const quintro_1 = require("./quintro");
expect.extend({
    toMatchOrderInsensitive(actual, expected) {
        const messages = [];
        const unexpected = actual.subtract(expected);
        if (!unexpected.isEmpty()) {
            messages.push(`Found items that were not expected:\n${this.utils.printReceived(unexpected)}`);
        }
        const missing = expected.subtract(actual);
        if (!missing.isEmpty()) {
            messages.push(`Did not find expected items:\n${this.utils.printExpected(missing)}\n\nFound:\n${this.utils.printReceived(actual)}`);
        }
        const message = messages.join("\n\n");
        if (messages.length > 0) {
            return {
                pass: false,
                message: () => message,
            };
        }
        return {
            pass: true,
            message: () => "Collections were identical; exptected some differences",
        };
    }
});
function assertQuintros({ layout, quintros }) {
    if (layout.noQuintros) {
        it("should not return any quintros", () => {
            expect(quintros).toHaveProperty("size", 0);
        });
    }
    else {
        it("should return the expected quintros", () => {
            expect(quintros).toMatchOrderInsensitive(layout.quintros);
        });
    }
}
beforeAll(() => {
    jest.addMatchers(immutableMatchers);
});
describe("quintro utils", () => {
    describe("getPotentialQuintros", () => {
        Object.keys(potential_quintros_board_layouts_1.default).forEach((layoutName) => {
            const layout = potential_quintros_board_layouts_1.default[layoutName];
            describe(layoutName, () => {
                const quintros = (0, quintro_1.getPotentialQuintros)(layout.board, { startCell: layout.startCell });
                assertQuintros({ layout, quintros });
            });
        });
    });
    describe("getAllPotentialQuintros", () => {
        Object.keys(all_potential_quintros_board_layouts_1.default).forEach((layoutName) => {
            const layout = all_potential_quintros_board_layouts_1.default[layoutName];
            describe(layoutName, () => {
                const quintros = (0, quintro_1.getAllPotentialQuintros)(layout.board);
                assertQuintros({ layout, quintros });
            });
        });
    });
    describe("getQuintrosForCell", () => {
        Object.keys(quintro_board_layouts_1.default).forEach((layoutName) => {
            const layout = quintro_board_layouts_1.default[layoutName];
            describe(layoutName, () => {
                const quintros = (0, quintro_1.getQuintrosForCell)(layout.board, { startCell: layout.startCell });
                assertQuintros({ layout, quintros });
            });
        });
        it("should return an empty set if there are no filled cells", () => {
            const board = new board_1.default({
                width: 10,
                height: 10,
                filledCells: [],
            });
            expect((0, quintro_1.getQuintrosForCell)(board, {})).toEqualImmutable((0, immutable_1.Set)());
        });
    });
    describe("getQuintros", () => {
        it("should use the last filled cell", () => {
            const { board } = (0, utils_1.quintroSpecFromGrid)({
                grid: `
	1  -  1  -  -  -  -  1  -  1
	-  -  1  -  -  -  -  -  -  -
	-  -  -  -  -  -  -  -  -  -
	-  -  -  -  -  -  -  -  -  2
	-  -  -  -  -  -  -  -  2  -
	-  -  -  -  -  -  -  2  -  -
	-  -  -  -  -  -  2  -  -  -
	-  -  -  -  -  2  -  -  -  -
	-  -  -  -  -  -  -  -  -  -
	-  -  -  -  -  -  -  -  -  -
	`,
            });
            const quintros = (0, quintro_1.getQuintros)(board);
            expect(quintros.first().get("cells").first().get("color")).toBe(utils_1.DEFAULT_COLORS[1]);
        });
    });
    describe("getPotentialQuintroDelta", () => {
        Object.keys(quintro_delta_board_layouts_1.default).forEach((layoutName) => {
            const layout = quintro_delta_board_layouts_1.default[layoutName];
            describe(layoutName, () => {
                const delta = (0, quintro_1.getPotentialQuintroDelta)(layout.board, { newCell: layout.newCell });
                it("should find the added quintros", () => {
                    expect(delta.get("added")).toMatchOrderInsensitive(layout.delta.get("added"));
                });
                it("should find the removed quintros", () => {
                    expect(delta.get("removed")).toMatchOrderInsensitive(layout.delta.get("removed"));
                });
                it("should find the appropriate changes in quintros", () => {
                    expect(delta.get("changed")).toMatchOrderInsensitive(layout.delta.get("changed"));
                });
            });
        });
    });
});
