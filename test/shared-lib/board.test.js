/* globals describe, it */

const _         = require("lodash");
const rfr       = require("rfr");
const expect    = rfr("test/expect-extended");
const Board     = rfr("shared-lib/board");
const {
	PLAYER_COLORS
}               = rfr("test/shared-lib/test-data/board/utils");

// This is suuuuuuper hacky, but Node doesn't appear to expose the AssertionError
// class itself anywhere, so this seems to be the only way to get at it.
let AssertionError;

try {
	require("assert").fail();
}
catch (ex) {
	AssertionError = ex.constructor;
}

const potentialQuintroBoardLayouts = rfr("test/shared-lib/test-data/board/potential-quintros-board-layouts");

const allPotentialQuintroBoardLayouts = rfr("test/shared-lib/test-data/board/all-potential-quintros-board-layouts");

const quintroBoardLayouts = rfr("test/shared-lib/test-data/board/quintro-board-layouts");

const quintroDeltaBoardLayouts = rfr("test/shared-lib/test-data/board/quintro-delta-board-layouts");

function assertQuintros({ layout, quintros }) {
	if (layout.noQuintros) {
		it("should not return any quintros", function() {
			expect(quintros).toBeEmpty();
		});
	}
	else {
		it("should return the expected quintros", function() {
			expect(quintros).toMatchOrderInsensitive(layout.quintros);
		});
	}
}

describe("Board", function() {
	describe("constructor", function() {
		it("should throw an assertion error if width is undefined", function() {
			expect(
				() => new Board({
					height: 5,
				})
			).toThrow(AssertionError);
		});

		it("should throw an assertion error if width is less than 0", function() {
			expect(
				() => new Board({
					width: -2
				})
			).toThrow(AssertionError);
		});

		it("should throw an assertion error if width is not an integer", function() {
			expect(
				() => new Board({
					width: 5.6
				})
			).toThrow(AssertionError);
		});
		
		it("should throw an assertion error if height is undefined", function() {
			expect(
				() => new Board({
					width: 5
				})
			).toThrow(AssertionError);
		});

		it("should throw an assertion error if height is less than 0", function() {
			expect(
				() => new Board({
					height: -2
				})
			).toThrow(AssertionError);
		});

		it("should throw an assertion error if height is not an integer", function() {
			expect(
				() => new Board({
					height: 5.6
				})
			).toThrow(AssertionError);
		});

		it("should throw an assertion error if filledCells is not an array", function() {
			expect(
				() => new Board({
					width: 5,
					height: 5,
					filledCells: "not proper"
				})
			).toThrow(AssertionError);
		});

		it("should not throw an error if all parameters are valid", function() {
			expect(
				() => new Board({
					width: 5,
					height: 5,
					filledCells: []
				})
			).toNotThrow();
		});
	});

	describe("getCell", function() {
		const board = new Board({
			width: 10,
			height: 10,
			filledCells: [
				{
					position: [1, 1],
					color: PLAYER_COLORS[0],
				},
			],
		});

		it("should throw an assertion error if passed a negative column or row index", function() {
			expect(
				// eslint-disable-next-line no-magic-numbers
				() => board.getCell([-1, 2])
			).toThrow(AssertionError);
			expect(
				// eslint-disable-next-line no-magic-numbers
				() => board.getCell([1, -2])
			).toThrow(AssertionError);
		});

		it("should throw an assertion error if passed a column or row index outside the board bounds", function() {
			expect(
				// eslint-disable-next-line no-magic-numbers
				() => board.getCell([20, 1])
			).toThrow(AssertionError);
			expect(
				// eslint-disable-next-line no-magic-numbers
				() => board.getCell([1, 20])
			).toThrow(AssertionError);
		});

		it("should return a Map with `position` and `color` properties", function() {
			const cell = board.getCell([1, 1]);
			expect(cell.has("position")).toExist("cell has a position key");
			expect(cell.has("color")).toExist("cell has a color key");
			expect(cell.get("color")).toBe(PLAYER_COLORS[0], "cell color is correct");
		});
	});

	describe("getPotentialQuintros", function() {
		_.each(
			potentialQuintroBoardLayouts,
			(layout, layoutName) => {
				describe(layoutName, function() {
					const quintros = layout.board.getPotentialQuintros({
						startCell: layout.startCell
					});

					assertQuintros({ layout, quintros });
				});
			}
		);
	});

	describe("getAllPotentialQuintros", function() {
		_.each(
			allPotentialQuintroBoardLayouts,
			(layout, layoutName) => {
				describe(layoutName, function() {
					const quintros = layout.board.getAllPotentialQuintros();

					assertQuintros({ layout, quintros });
				});
			}
		);
	});

	describe("getQuintros", function() {
		_.each(
			quintroBoardLayouts,
			(layout, layoutName) => {
				describe(layoutName, function() {
					const quintros = layout.board.getQuintros({
						startCell: layout.startCell
					});

					assertQuintros({ layout, quintros });
				});
			}
		);
	});

	describe("getPotentialQuintroDelta", function() {
		_.each(
			quintroDeltaBoardLayouts,
			(layout, layoutName) => {
				describe(layoutName, function() {
					const delta = layout.board.getPotentialQuintroDelta({
						newCell: layout.newCell
					});

					it("should find the added quintros", function() {
						expect(delta.get("added")).toMatchOrderInsensitive(
							layout.delta.get("added")
						);
					});

					it("should find the removed quintros", function() {
						expect(delta.get("removed")).toMatchOrderInsensitive(
							layout.delta.get("removed")
						);
					});

					it("should find the appropriate changes in quintros", function() {
						expect(delta.get("changed")).toMatchOrderInsensitive(
							layout.delta.get("changed")
						);
					});
				});
			}
		);
	});
});

