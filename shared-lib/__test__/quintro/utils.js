"use strict";

/**
 * @module utils
 * @memberof test.shared-lib.test-data
 */

const {
	Set
} = require("immutable");
const Quintro = require("../../quintro");
const {
	quintroSpecFromGrid,
	DEFAULT_COLORS
} = require("../utils");

const rangeRegex = /^(\d+)(?:-(\d+))?$/;

/**
 * Convenience function for transforming a string into a range of cell coordinates.
 *
 * @param {object} args - the function arguments
 * @param {string} args.range - a string representing a range to transform into cell coordinates
 *		Range is a string of the form "[column range],[row range]", where [column range] and
 *		[row range] are each strings that match the pattern /^\d+(-\d+)?$/. If only one number
 *		is specified, that part of the coordinate stays constant for all elements in the return
 *		value. Otherwise, the return value includes a cell coordinate for each number in the
 *		range from the first number to the last number, inclusive, increased by 1 each time. If
 *		the first number is greater than the second number, then that part of the cell
 *		coordinates (column or row) will decrease by 1 each time, instead of increasing by 1.
 *
 * Examples:
 * ```
 * "1-6,6-1" => [
 *  	{ position: [1, 6] }, 
 *  	{ position: [2, 5] }, 
 *  	{ position: [3, 4] }, 
 *  	{ position: [4, 3] }, 
 *  	{ position: [5, 2] }, 
 *  	{ position: [6, 1] }
 * ]
 *
 * "3-7,5"   => [
 *  	{ position: [3, 5] }, 
 *  	{ position: [4, 5] }, 
 *  	{ position: [5, 5] }, 
 *  	{ position: [6, 5] }, 
 *  	{ position: [7, 5] }
 * ]
 *
 * "6,4-9"   => [
 *  	{ position: [6, 4] }, 
 *  	{ position: [6, 5] }, 
 *  	{ position: [6, 6] }, 
 *  	{ position: [6, 7] }, 
 *  	{ position: [6, 8] }, 
 *  	{ position: [6, 9] }
 * ]
 * ```
 *
 * If a cell is represented in the filledMap, its color is added to the cell coordinate under
 *		the key "color" (e.g. { position: [1, 2], color: "blue" })
 * @param {shared-lib.Board} [args.board] - the board in which the cells exist
 *
 * @returns {Types.Cell[]} list of cells from the specified range
 */
function quintroCellsFromRange({ range, board }) {
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

		const cell = board && board.getCell(position);

		cells.push(
			{
				position,
				color: cell ? cell.get("color") : undefined, 
			}
		);
	}

	return cells;
}

/**
 * Creates a layout object for use by the tests from a given grid and set of cell ranges.
 *
 * @param {object} args - the function arguments
 * @param {string} args.grid - the grid as a string, from which to generate the game board.
 *	See {@link test.utils.quintroSpecFromGrid} for the expected format of the grid string.
 * @param {string[]} args.ranges - a list of range strings from which to generate cell ranges.
 *	See {@link test.shared-lib.game-board.quintroCellsFromRange} for format of the range strings.
 *
 * @return {{quintros: external:Immutable.Set<shared-lib.Quintro>, noQuintros: boolean, board: shared-lib.Board}} the layout spec for the test
 */
function generateLayout({ grid, ranges }) {
	const { board, startCell } = quintroSpecFromGrid({
		grid,
		colors: DEFAULT_COLORS
	});

	return {
		quintros: ranges ?
			Set(
				ranges.map(
					(range) => new Quintro({
						cells: quintroCellsFromRange({
							range,
							board
						})
					})
				)
			) :
			undefined,
		noQuintros: !ranges,
		board,
		startCell,
	};
}

exports = module.exports = {
	quintroCellsFromRange,
	generateLayout,
};
