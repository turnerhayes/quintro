/* eslint-env jest */

import { List, Map, Set, fromJS } from "immutable";
import * as immutableMatchers from "jest-immutable-matchers";
import quintroSelectors from "./quintros";

expect.extend({
	toBeASubsetOf(received, expected) {
		if (!(received instanceof Set)) {
			return {
				message: () => `expected ${received} to be an Immutable Set`,
				pass: false,
			};
		}

		if (!(expected instanceof Set)) {
			return {
				message: () => `expected ${expected} to be an Immutable Set`,
				pass: false,
			};
		}

		if (received.isSubset(expected)) {
			return {
				message: () => `expected ${received}
to not be a subset of
${expected}`,
				pass: true,
			};
		}
		else {
			return {
				message: () => `expected ${received}
to be a subset of
${expected}`,
				pass: false,
			};
		}
	},
});

function testQuintros({ initialState, quintros, direction }) {
	const hasMultipleQuintros = quintros.length > 1;
	const quintroString = `quintro${hasMultipleQuintros ? "s" : ""}`;

	describe(`${direction} ${quintroString}`, () => {
		it(`should return a quintro for all cells in the ${quintroString}`, () => {
			quintros = quintros.reduce(
				(setOfQuintros, quintro) => setOfQuintros.add(
					Set(
						fromJS(
							quintro.map(
								(position) => (
									{
										position,
										color: initialState.get("currentPlayerColor"),
									}
								)
							)
						)
					)
				),
				Set()
			);

			const quintroFilledCells = quintros.reduce(
				(cells, quintro) => cells.union(quintro),
				Set()
			).toList();

			const modifiedState = initialState.set(
				"filled",
				quintroFilledCells
			);

			quintros.forEach(
				(quintro) => quintro.forEach(
					(cell) => {
						const state = quintroSelectors.getQuintrosForCell(
							modifiedState,
							{
								position: cell.get("position"),
							}
						);

						expect(state).toBeASubsetOf(quintros);
					}
				)
			);
		});
	});
}

describe("quintros selectors", () => {
	beforeEach(() => {
		jest.addMatchers(immutableMatchers);
	});

	const currentPlayerColor = "blue";

	const initialState = fromJS({
		board: {
			width: 10,
			height: 10,
			filled: List(),
		},
		currentPlayerColor,
	});

	describe("getQuintrosForCell", () => {
		it("should return no quintros when the board is empty", () => {
			for (let rowIndex = 0; rowIndex < initialState.getIn(["board", "height"]); rowIndex++) {
				for (let columnIndex = 0; columnIndex < initialState.getIn(["board", "width"]); columnIndex++) {
					const state = quintroSelectors.getQuintrosForCell(
						initialState,
						{
							position: [columnIndex, rowIndex],
						}
					);

					expect(state).toEqualImmutable(Set());
				}
			}
		});

		it("should return no quintros when looking at an unfilled cell", () => {
			const state = quintroSelectors.getQuintrosForCell(
				initialState.updateIn(
					["board", "filled"],
					(filledCells) => filledCells.push(
						/* eslint-disable no-magic-numbers */
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([3, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([4, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([5, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([6, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([7, 2]),
						}),
						/* eslint-enable no-magic-numbers */
					)
				),
				{
					// eslint-disable-next-line no-magic-numbers
					position: List([9, 9])
				}
			);

			expect(state).toEqualImmutable(Set());
		});

		it("should return no quintros when blocked by another color", () => {
			const state = quintroSelectors.getQuintrosForCell(
				initialState.updateIn(
					["board", "filled"],
					(filledCells) => filledCells.push(
						/* eslint-disable no-magic-numbers */
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([3, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([4, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([5, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([6, 2]),
						}),
						Map({
							color: "puce",
							position: List([7, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([8, 2]),
						}),
						/* eslint-enable no-magic-numbers */
					)
				),
				{
					// eslint-disable-next-line no-magic-numbers
					position: List([6, 2])
				}
			);

			expect(state).toEqualImmutable(Set());
		});

		it("should return a quintro when there are exactly 5 filled cells in a row", () => {
			const quintro = [
				/* eslint-disable no-magic-numbers */
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([3, 2]),
				}),
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([4, 2]),
				}),
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([5, 2]),
				}),
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([6, 2]),
				}),
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([7, 2]),
				}),
				/* eslint-enable no-magic-numbers */
			];

			const state = quintroSelectors.getQuintrosForCell(
				initialState.updateIn(
					["board", "filled"],
					(filledCells) => filledCells.push(
						...quintro
					)
				),
				{
					// eslint-disable-next-line no-magic-numbers
					position: List([7, 2])
				}
			);

			expect(state).toEqualImmutable(Set([Set(quintro)]));
		});

		it("should return a quintro when there are more than 5 filled cells in a row", () => {
			const quintro = [
				/* eslint-disable no-magic-numbers */
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([3, 2]),
				}),
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([4, 2]),
				}),
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([5, 2]),
				}),
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([6, 2]),
				}),
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([7, 2]),
				}),
				Map({
					color: initialState.get("currentPlayerColor"),
					position: List([8, 2]),
				}),
				/* eslint-enable no-magic-numbers */
			];

			const state = quintroSelectors.getQuintrosForCell(
				initialState.updateIn(
					["board", "filled"],
					(filledCells) => filledCells.push(
						...quintro
					)
				),
				{
					// eslint-disable-next-line no-magic-numbers
					position: List([7, 2])
				}
			);

			expect(state).toEqualImmutable(Set([Set(quintro)]));
		});

		it("should return no quintros when there are fewer than 5 filled cells in a row", () => {
			const state = quintroSelectors.getQuintrosForCell(
				initialState.updateIn(
					["board", "filled"],
					(filledCells) => filledCells.push(
						/* eslint-disable no-magic-numbers */
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([3, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([4, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([5, 2]),
						}),
						Map({
							color: initialState.get("currentPlayerColor"),
							position: List([6, 2]),
						}),
						/* eslint-enable no-magic-numbers */
					)
				),
				{
					// eslint-disable-next-line no-magic-numbers
					position: List([5, 2])
				}
			);

			expect(state).toEqualImmutable(Set());
		});

		testQuintros({
			initialState,
			quintros: [
				[
					/* eslint-disable no-magic-numbers */
					[1, 0],
					[2, 0],
					[3, 0],
					[4, 0],
					[5, 0],
					/* eslint-enable no-magic-numbers */
				],
			],
			direction: "horizontal",
		});

		testQuintros({
			initialState,
			quintros: [
				[
					/* eslint-disable no-magic-numbers */
					[3, 1],
					[3, 2],
					[3, 3],
					[3, 4],
					[3, 5],
					/* eslint-enable no-magic-numbers */
				],
			],
			direction: "vertical",
		});

		testQuintros({
			initialState,
			quintros: [
				[
					/* eslint-disable no-magic-numbers */
					[3, 1],
					[4, 2],
					[5, 3],
					[6, 4],
					[7, 5],
					/* eslint-enable no-magic-numbers */
				],
			],
			direction: "top left to bottom right diagonal",
		});

		testQuintros({
			initialState,
			quintros: [
				[
					/* eslint-disable no-magic-numbers */
					[3, 6],
					[4, 5],
					[5, 4],
					[6, 3],
					[7, 2],
					/* eslint-enable no-magic-numbers */
				],
			],
			direction: "top right to bottom left diagonal",
		});

		testQuintros({
			initialState,
			quintros: [
				[
					/* eslint-disable no-magic-numbers */
					[3, 6],
					[4, 5],
					[5, 4],
					[6, 3],
					[7, 2],
					/* eslint-enable no-magic-numbers */
				],
				[
					/* eslint-disable no-magic-numbers */
					[2, 1],
					[3, 2],
					[4, 3],
					[5, 4],
					[6, 5],
					/* eslint-enable no-magic-numbers */
				],
			],
			direction: "both diagonal",
		});

		testQuintros({
			initialState,
			quintros: [
				[
					/* eslint-disable no-magic-numbers */
					[4, 6],
					[5, 6],
					[6, 6],
					[7, 6],
					[8, 6],
					/* eslint-enable no-magic-numbers */
				],
				[
					/* eslint-disable no-magic-numbers */
					[8, 3],
					[8, 4],
					[8, 5],
					[8, 6],
					[8, 7],
					/* eslint-enable no-magic-numbers */
				],
			],
			direction: "horizontal and vertical",
		});

		testQuintros({
			initialState,
			quintros: [
				[
					/* eslint-disable no-magic-numbers */
					[4, 6],
					[5, 6],
					[6, 6],
					[7, 6],
					[8, 6],
					/* eslint-enable no-magic-numbers */
				],
				[
					/* eslint-disable no-magic-numbers */
					[8, 3],
					[8, 4],
					[8, 5],
					[8, 6],
					[8, 7],
					/* eslint-enable no-magic-numbers */
				],
				[
					/* eslint-disable no-magic-numbers */
					[5, 3],
					[6, 4],
					[7, 5],
					[8, 6],
					[9, 7],
					/* eslint-enable no-magic-numbers */
				],
				[
					/* eslint-disable no-magic-numbers */
					[5, 9],
					[6, 8],
					[7, 7],
					[8, 6],
					[9, 5],
					/* eslint-enable no-magic-numbers */
				],
			],
			direction: "all four",
		});
	});
});
