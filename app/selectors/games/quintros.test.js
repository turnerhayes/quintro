import { fromJS, Set } from "immutable";
import * as immutableMatchers from "jest-immutable-matchers";

import Quintro from "@shared-lib/quintro";
import { generateLayout } from "@shared-lib/__test__/quintro/utils";
import { quintroSpecFromGrid, DEFAULT_COLORS } from "@shared-lib/__test__/utils";

import { getQuintros, getQuintrosForCell } from "./quintros";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("quintro selectors", () => {
	describe("getQuintrosForCell", () => {
		it("should return the quintros for an arbitrary cell in a quintro", () => {
			const grid = `
			-  -  -  -  -  -  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			-  -  1 ^1  1  1  1  -  -  -
			-  -  -  -  -  -  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			2  -  2  -  2  -  2  -  -  -
			-  -  -  -  -  -  -  -  -  -
			`;

			const { board, startCell, quintros } = generateLayout({
				grid,
				ranges: [
					"2-6,3",
				],
			});

			const game = fromJS({
				board,
			});

			expect(getQuintrosForCell(game, { startCell })).toEqualImmutable(quintros);
		});
	});
	
	describe("getQuintros", () => {
		it("should return the quintros for the last placed cell in a quintro", () => {
			const grid = `
			-  -  -  -  -  -  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			-  -  1  1  1  1  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			-  -  -  -  -  -  -  -  -  -
			2  -  2  -  2  -  2  -  -  -
			-  -  -  -  -  -  -  -  -  -
			`;

			let { board } = quintroSpecFromGrid({
				grid,
			});

			const lastCell = fromJS({
				// eslint-disable-next-line no-magic-numbers
				position: [6, 3],
				color: DEFAULT_COLORS[0],
			});

			board = board.fillCells(lastCell);

			const game = fromJS({
				board,
			});

			const cells = [];

			// eslint-disable-next-line no-magic-numbers
			for (let column = 2; column <= 6; column++) {
				cells.push({
					// eslint-disable-next-line no-magic-numbers
					position: [column, 3],
					color: DEFAULT_COLORS[0],
				});
			}

			const quintros = Set.of(
				new Quintro({
					cells,
				})
			);

			expect(getQuintros(game, { startCell: lastCell })).toEqualImmutable(quintros);
		});
	});
});
