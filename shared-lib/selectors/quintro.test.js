import { Set } from "immutable";
import * as immutableMatchers from "jest-immutable-matchers";

import { DEFAULT_COLORS, quintroSpecFromGrid } from "../__test__/utils";
import potentialQuintroBoardLayouts from "../__test__/quintro/potential-quintros-board-layouts";
import allPotentialQuintroBoardLayouts from "../__test__/quintro/all-potential-quintros-board-layouts";
import quintroBoardLayouts from "../__test__/quintro/quintro-board-layouts";
import quintroDeltaBoardLayouts from "../__test__/quintro/quintro-delta-board-layouts";
import Board from "../board";

import { getQuintros, getQuintrosForCell, getPotentialQuintros, getAllPotentialQuintros, getPotentialQuintroDelta } from "./quintro";


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
		Object.keys(potentialQuintroBoardLayouts).forEach(
			(layoutName) => {
				const layout = potentialQuintroBoardLayouts[layoutName];

				describe(layoutName, () => {
					const quintros = getPotentialQuintros(
						layout.board,
						{ startCell: layout.startCell }
					);

					assertQuintros({ layout, quintros });
				});
			}
		);
	});

	describe("getAllPotentialQuintros", () => {
		Object.keys(allPotentialQuintroBoardLayouts).forEach(
			(layoutName) => {
				const layout = allPotentialQuintroBoardLayouts[layoutName];

				describe(layoutName, () => {
					const quintros = getAllPotentialQuintros(layout.board);

					assertQuintros({ layout, quintros });
				});
			}
		);
	});

	describe("getQuintrosForCell", () => {
		Object.keys(quintroBoardLayouts).forEach(
			(layoutName) => {
				const layout = quintroBoardLayouts[layoutName];

				describe(layoutName, () => {
					const quintros = getQuintrosForCell(
						layout.board,
						{ startCell: layout.startCell }
					);

					assertQuintros({ layout, quintros });
				});
			}
		);

		it("should return an empty set if there are no filled cells", () => {
			const board = new Board({
				width: 10,
				height: 10,
				filledCells: [],
			});

			expect(getQuintrosForCell(board, {})).toEqualImmutable(Set());
		});
	});

	describe("getQuintros", () => {
		it("should use the last filled cell", () => {
			const { board } = quintroSpecFromGrid({
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

			const quintros = getQuintros(board);

			expect(quintros.first().get("cells").first().get("color")).toBe(DEFAULT_COLORS[1]);
		});
	});

	describe("getPotentialQuintroDelta", () => {
		Object.keys(quintroDeltaBoardLayouts).forEach(
			(layoutName) => {
				const layout = quintroDeltaBoardLayouts[layoutName];

				describe(layoutName, () => {
					const delta = getPotentialQuintroDelta(
						layout.board,
						{ newCell: layout.newCell }
					);

					it("should find the added quintros", () => {
						expect(delta.get("added")).toMatchOrderInsensitive(
							layout.delta.get("added")
						);
					});

					it("should find the removed quintros", () => {
						expect(delta.get("removed")).toMatchOrderInsensitive(
							layout.delta.get("removed")
						);
					});

					it("should find the appropriate changes in quintros", () => {
						expect(delta.get("changed")).toMatchOrderInsensitive(
							layout.delta.get("changed")
						);
					});
				});
			}
		);
	});
});
