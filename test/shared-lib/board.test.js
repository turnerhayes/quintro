/* globals describe, it */

const _         = require("lodash");
const expect    = require("expect");
const {
	Set,
	Map,
	is
}               = require("immutable");
const rfr       = require("rfr");
const Board     = rfr("shared-lib/board");
const Quintro   = rfr("shared-lib/quintro");
const {
	quintroSpecFromGrid
}               = rfr("test/utils");

const PLAYER_COLORS = ["blue", "green"];

function _replacer(key, value) {
	if (
		// Assume that any array of two elements that consists of two numbers
		// is a position tuple and display it as such
		// eslint-disable-next-line no-magic-numbers
		Array.isArray(value) && value.length === 2 &&
		typeof value[0] === "number" && typeof value[1] === "number"
	) {
		return JSON.stringify(value);
	}

	return value;
}

const rangeRegex = /^(\d+)(?:-(\d+))?$/;

// This is suuuuuuper hacky, but Node doesn't appear to expose the AssertionError
// class itself anywhere, so this seems to be the only way to get at it.
let AssertionError;

try {
	const assert = require("assert");

	assert.fail();
}
catch (ex) {
	AssertionError = ex.constructor;
}

/**
 * Convenience function for transforming a string into a range of cell coordinates.
 *
 * @memberof test.shared-lib
 *
 * @param {string} range - a string representing a range to transform into cell coordinates
 *		Range is a string of the form "[column range],[row range]", where [column range] and
 *		[row range] are each strings that match the pattern /^\d+(-\d+)?$/. If only one number
 *		is specified, that part of the coordinate stays constant for all elements in the return
 *		value. Otherwise, the return value includes a cell coordinate for each number in the
 *		range from the first number to the last number, inclusive, increased by 1 each time. If
 *		the first number is greater than the second number, then that part of the cell
 *		coordinates (column or row) will decrease by 1 each time, instead of increasing by 1.
 *
 *		Examples:
 *			"1-6,6-1" => [
 * 				{ "position": [1, 6] }, 
 * 				{ "position": [2, 5] }, 
 * 				{ "position": [3, 4] }, 
 * 				{ "position": [4, 3] }, 
 * 				{ "position": [5, 2] }, 
 * 				{ "position": [6, 1] }
 *			]
 *
 *			"3-7,5"   => [
 * 				{ "position": [3, 5] }, 
 * 				{ "position": [4, 5] }, 
 * 				{ "position": [5, 5] }, 
 * 				{ "position": [6, 5] }, 
 * 				{ "position": [7, 5] }
 *			]
 *
 *			"6,4-9"   => [
 * 				{ "position": [6, 4] }, 
 * 				{ "position": [6, 5] }, 
 * 				{ "position": [6, 6] }, 
 * 				{ "position": [6, 7] }, 
 * 				{ "position": [6, 8] }, 
 * 				{ "position": [6, 9] }
 *			]
 *
 *		If a cell is represented in the filledMap, its color is added to the cell coordinate under
 *		the key "color" (e.g. { "position": [1, 2], "color": "blue" })
 * @param {object} filledMap - an object mapping cell coordinates of filled cells to the color
 *	that fills them (e.g. {"1,1": "blue"} means that the cell at [1, 1] is filled by the color
 *	blue)
 *
 * @returns {Array<Array<number, number>>} list of cell coordinates from the specified range
 */
function quintroCellsFromRange(range, filledMap) {
	const cells = [];

	let [columnRange, rowRange] = range.split(",");

	let matches = rangeRegex.exec(columnRange);

	let columnRangeStart, columnRangeEnd;
	let rowRangeStart, rowRangeEnd;

	if (matches) {
		columnRangeStart = Number(matches[1]);
		columnRangeEnd = matches[2] ? Number(matches[2]) : columnRangeStart;
	}
	else {
		throw new Error("column range did not match the range pattern");
	}

	matches = rangeRegex.exec(rowRange);

	if (matches) {
		rowRangeStart = Number(matches[1]);
		rowRangeEnd = matches[2] ? Number(matches[2]) : rowRangeStart;
	}
	else {
		throw new Error("row range did not match the range pattern");
	}

	const columnRangeSize = columnRangeEnd - columnRangeStart;
	const rowRangeSize = rowRangeEnd - rowRangeStart;

	if (columnRangeSize > 0 && rowRangeSize > 0 && columnRangeSize !== rowRangeSize) {
		throw new Error(`Range size mismatch: column has a range size of ${columnRangeSize}, row has a range size of ${rowRangeSize}`);
	}

	const rangeSize = Math.max(columnRangeSize, rowRangeSize);
	const columnDelta = columnRangeSize === 0 ?
		0 :
		(
			columnRangeSize > 0 ?
				1 :
				-1
		);

	const rowDelta = rowRangeSize === 0 ?
		0 :
		(
			rowRangeSize > 0 ?
				1 :
				-1
		);

	for (let i = 0; i <= rangeSize; i++) {
		const position = [
			columnRangeStart + (i * columnDelta),
			rowRangeStart + (i * rowDelta),
		];

		cells.push({
			position,
			color: filledMap[JSON.stringify(position)], 
		});
	}

	return cells;
}

/**
 * Creates a layout object for use by the tests from a given grid and set of cell ranges.
 *
 * @memberof test.shared-lib
 *
 * @param {object} args - the function arguments
 * @param {string} args.grid - the grid as a string, from which to generate the game board.
 *	See {@link test.utils.quintroSpecFromGrid} for the expected format of the grid string.
 * @param {string[]} args.ranges - a list of range strings from which to generate cell ranges.
 *	See {@link test.shared-lib.game-board.quintroCellsFromRange} for format of the range strings.
 *
 * @return {{quintros: Array<Types.Cell[]>, noQuintros: boolean, board: object}} the layout spec for the test
 */
function generateLayout({ grid, ranges }) {
	const { board, startCell } = quintroSpecFromGrid({
		grid,
		colors: PLAYER_COLORS
	});

	const filledMap = board.filledCells.reduce(
		(map, cell) => {
			map[JSON.stringify(cell.get("position"))] = cell.get("color");

			return map;
		},
		{}
	);

	return {
		quintros: ranges ?
			ranges.map(
				(range) => quintroCellsFromRange(range, filledMap)
			) :
			undefined,
		noQuintros: !ranges,
		board,
		startCell
	};
}

const potentialQuintroBoardLayouts = {
	"Potential horizontal with gap": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		1  1 ^1  -  -  1  1  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,
		ranges: [
			"0-6,1",
						
			"2,0-4",

			"2,1-5",

			"1-5,0-4",

			"2-6,1-5",
		],
	}),
	
	"Potential vertical with gap": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  1  -  -  -  -  -
		-  -  -  - ^1  -  -  -  -  -
		-  -  -  -  1  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  1  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,
		ranges: [
			"4,0-4",

			"4,2-6",
						
			"0-4,3",

			"1-5,3",

			"2-6,3",

			"3-7,3",

			"4-8,3",

			"1-5,0-4",

			"2-6,1-5",

			"3-7,2-6",

			"4-8,3-7",

			"0-4,7-3",

			"1-5,6-2",

			"2-6,5-1",

			"3-7,4-0",
		],
	}),

	"Potential quintro blocked by another player": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  2  -  -  -  -  -
		-  -  -  2  1  2  -  -  -  -
		-  -  -  2 ^1  2  -  -  -  -
		-  -  -  2  1  2  -  -  -  -
		-  -  -  -  2  -  -  -  -  -
		-  -  -  -  1  -  -  -  -  -
		-  -  -  -  1  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,
	}),

	"Potential top left to bottom right with gap": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		-  1  -  -  -  -  -  -  -  -
		-  -  1  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  - ^1  -  -  -  -  -
		-  -  -  -  -  1  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,
		ranges: [
			"1-5,1-5",

			"4-8,4-8",

			"4,0-4",

			"4,1-5",

			"4,2-6",

			"4,3-7",

			"4,4-8",

			"0-4,4",

			"1-5,4",

			"2-6,4",

			"3-7,4",

			"4-8,4",

			"4-8,4-0",

			"3-7,5-1",

			"2-6,6-2",

			"1-5,7-3",

			"0-4,8-4",
		],
	}),
};

const allPotentialQuintroBoardLayouts = {
	"sample board": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		1  1  1  -  -  1  1  2  -  -
		-  -  2  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  2  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  2  -  -  -  2  -  -
		-  -  -  -  2  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,
		ranges: [
			/// Horizontal
			"0-6,1", // player 1

			"0-4,2", // player 2

			"0-4,5", // player 2

			"0-4,6", // player 2

			"1-5,2", // player 2

			"1-5,5", // player 2

			"1-5,6", // player 2

			"2-6,2", // player 2

			"2-6,6", // player 2

			"3-7,3", // player 2

			"3-7,5", // player 2

			"3-7,6", // player 2

			"4-8,3", // player 2

			"4-8,6", // player 2

			"5-9,3", // player 2

			"5-9,5", // player 2

			/// Vertical
			"0,0-4", // player 1

			"0,1-5", // player 1

			"1,0-4", // player 1

			"1,1-5", // player 1

			"2,2-6", // player 2

			"3,1-5", // player 2

			"3,2-6", // player 2

			"3,3-7", // player 2

			"3,4-8", // player 2

			"3,5-9", // player 2

			"4,2-6", // player 2

			"4,3-7", // player 2

			"4,4-8", // player 2

			"4,5-9", // player 2

			"5,0-4", // player 1

			"5,1-5", // player 1

			"6,0-4", // player 1

			"6,1-5", // player 1

			"7,1-5", // player 1

			"7,3-7", // player 2

			"7,5-9", // player 2

			/// Top left to bottom right
			"0-4,1-5", // player 1

			"0-4,2-6", // player 2

			"1-5,0-4", // player 1

			"1-5,3-7", // player 2

			"2-6,1-5", // player 1

			"2-6,2-6", // player 2

			"2-6,4-8", // player 2

			"3-7,5-9", // player 2

			"3-7,1-5", // player 2

			"4-8,2-6", // player 2

			"5-9,0-4", // player 1

			"5-9,3-7", // player 2

			/// Top right to bottom left
			"0-4,4-0", // player 2

			"0-4,8-4", // player 2

			"1-5,5-1", // player 2

			"1-5,7-3", // player 2

			"1-5,9-5", // player 2

			"2-6,4-0", // player 1

			"2-6,5-1", // player 1

			"3-7,4-0", // player 1

			"3-7,5-1", // player 2

			"3-7,7-3", // player 2

			"3-7,9-5", // player 2

			"4-8,6-2", // player 2

			"4-8,8-4", // player 2

			"5-9,7-3", // player 2
		],
	}),
};

const quintroBoardLayouts = {
	horizontal: generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		1  1 ^1  1  1  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,

		ranges: [
			"0-4,1"
		]
	}),

	vertical: generateLayout({
		grid: `
		 -  -  -  -  -  -  -  -  -  -
		 1  -  -  -  -  -  -  -  -  -
		 1  -  -  -  -  -  -  -  -  -
		^1  -  -  -  -  -  -  -  -  -
		 1  -  -  -  -  -  -  -  -  -
		 1  -  -  -  -  -  -  -  -  -
		 -  -  -  -  -  -  -  -  -  -
		 -  -  -  -  -  -  -  -  -  -
		 -  -  -  -  -  -  -  -  -  -
		 -  -  -  -  -  -  -  -  -  -
		`,

		ranges: [
			"0,1-5"
		]
	}),

	"top left to bottom right": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		-  -  1  -  -  -  -  -  -  -
		-  -  -  1  -  -  -  -  -  -
		-  -  -  -  1  -  -  -  -  -
		-  -  -  -  - ^1  -  -  -  -
		-  -  -  -  -  -  1  -  -  -
		-  -  -  -  -  -  -  1  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,

		ranges: [
			"2-7,1-6"
		]
	}),

	"top right to bottom left": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  1  -  -  -
		-  -  -  -  -  1  -  -  -  -
		-  -  -  -  1  -  -  -  -  -
		-  -  - ^1  -  -  -  -  -  -
		-  -  1  -  -  -  -  -  -  -
		-  1  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,

		ranges: [
			"1-6,6-1"
		]
	}),

	"both diagonals": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		1  -  -  -  -  -  1  -  -  -
		-  1  -  -  -  1  -  -  -  -
		-  -  1  -  1  -  -  -  -  -
		-  -  - ^1  -  -  -  -  -  -
		-  -  1  -  1  -  -  -  -  -
		-  1  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`,

		ranges: [
			"1-6,6-1",

			"0-4,1-5",
		]
	}),

	"horizontal and vertical": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  - ^1  1  1  1  1  -
		-  -  -  -  1  -  -  -  -  -
		-  -  -  -  1  -  -  -  -  -
		-  -  -  -  1  -  -  -  -  -
		-  -  -  -  1  -  -  -  -  -
		`,

		ranges: [
			"4-8,5",

			"4,5-9",
		]
	}),

	"starting from an unrelated cell": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		1  1  1  1  1  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  - ^1  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`
	}),

	"interrupted by another color": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		1 ^1  2  1  1  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`
	}),

	"fewer than 5 filled": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		1 ^1  1  1  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`
	}),

	"gap between filled cells": generateLayout({
		grid: `
		-  -  -  -  -  -  -  -  -  -
		1 ^1  -  1  1  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		-  -  -  -  -  -  -  -  -  -
		`
	}),
};

/**
 * Asserts that two sets of quintros are equivalent.
 *
 * @memberof test.shared-lib
 *
 * @param {object} args - function arguments
 * @param {Immutable.Set<shared-lib.Quintro>} expected - the quintros that we expect to find
 * @param {Immutable.Set<shared-lib.Quintro>} actual - the quintros that we found
 *
 * @return {void}
 */
function assertQuintros({ expected, actual }) {
	const unexpectedQuintros = actual.subtract(expected);

	expect(is(unexpectedQuintros, Set())).toExist(
		`Found quintros that were not expected: ${JSON.stringify(unexpectedQuintros, _replacer, "  ")}`
	);

	const missingQuintros = expected.subtract(actual);

	expect(is(missingQuintros, Set())).toExist(
		`Did not find expected quintros: ${JSON.stringify(expected, _replacer, "  ")}`
	);
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
			expect(Map.isMap(cell)).toExist("cell is a Map");
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
					
					if (layout.noQuintros) {
						it("should not return any quintros", function() {
							expect(is(quintros, Set())).toExist("quintro set should be empty");
						});
					}
					else {
						it("should return the expected quintros", function() {
							assertQuintros({
								expected: Set(layout.quintros.map((quintro) => new Quintro({
									cells: quintro
								}))),
								actual: quintros
							});
						});
					}
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

					if (layout.noQuintros) {
						it("should not return any quintros", function() {
							expect(is(quintros, Set())).toExist("quintro set should be empty");
						});
					}
					else {
						it("should return the expected quintros", function() {
							assertQuintros({
								expected: Set(layout.quintros.map((quintro) => new Quintro({
									cells: quintro
								}))),
								actual: quintros
							});
						});
					}
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

					if (layout.noQuintros) {
						it("should not return any quintros", function() {
							expect(is(quintros, Set())).toExist("quintro set should be empty");
						});
					}
					else {
						it("should return the expected quintros", function() {
							assertQuintros({
								expected: Set(layout.quintros.map((quintro) => new Quintro({
									cells: quintro
								}))),
								actual: quintros
							});
						});
					}
				});
			}
		);
	});
});

