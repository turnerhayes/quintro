/**
 * Utilities to make it easier to set up and run unit tests.
 *
 * @namespace utils
 * @memberof test
 */

const Config = require("../config");
const Board  = require("../board");
const { fromJS } = require("immutable");


const DEFAULT_COLORS = Config.game.colors.map(
	(color) => color.id
);

/**
 * Generates an object of values for creating a Board and finding
 * the start cell, if any.
 *
 * @memberof test.utils
 *
 * @param {object} args - the function arguments
 * @param {string} args.grid - a string representing the board to generate
 *	The string should look like this:
 *
 * ```
 * `
 * -  -  -  -  -  -  -
 * -  -  -  -  -  1  -
 * -  -  -  2  -  -  -
 * -  -  -  -  -  -  -
 * -  -  - ^3  -  -  -
 * -  -  -  -  -  -  -
 * -  -  -  -  -  -  -
 * `
 * ```
 *
 * Each cell is represented by a character; "-" represents an empty cell, while a cell with a number in
 *	it correponds to a cell filled by the element of the `colors` parameter specified by that number (1-based,
 *	so number 1 in the grid string corresponds to `colors[0]`. The cell that is prefixed with "^" is the
 *	startCell that is returned. This is optional; the board may have no start cell. Number of whitespaces before
 *	or after a row and between cells is insignificant; as long as there is at least one whitespace between cells,
 *	they will be recognized as distinct cells. This allows you a great deal of leeway in formatting of the grid
 *	string; in the example above, there are two spaces between each cell, except the start cell because of the
 *	"^" prefix. There could just as well be one space between each cell, or a tab, or 5 spaces...
 * @param {string[]} [args.colors=the color IDs of all configured colors in the app] - the color names
 *	to use for the occupied cells in the grid; this is a zero-based array, but the colors in the grid
 *	string are 1-based, so a cell with color "1" will use the color at index 0 in this array
 *
 * @return {{board: shared-lib.Board, startCell: Types.ImmutableCell}} the board and start cell parsed from the
 *	grid string
 */
function quintroSpecFromGrid({ grid, colors = DEFAULT_COLORS }) {
	const gridMatrix = grid.trim().split(/\s*\n\s*/).map(
		(row) => row.split(/\s+/)
	);

	const width = gridMatrix[0].length;
	const height = gridMatrix.length;
	let startCell;

	let filledCells = [];

	gridMatrix.forEach(
		(row, rowIndex) => {
			row.forEach(
				(cell, columnIndex) => {
					let index;
					let color;
					const matches = /^\^(\d+)/.exec(cell);

					if (matches) {
						index = Number(matches[1]);
						if (index > 0) {
							color = colors[index - 1];
							startCell = {
								position: [columnIndex, rowIndex],
								color
							};
						}
					}
					else {
						index = Number(cell);
						color = colors[index - 1];
					}


					if (index) {
						filledCells.push({
							position: [columnIndex, rowIndex],
							color
						});
					}
				}
			);
		}
	);

	return {
		board: new Board({
			width,
			height,
			filledCells,
		}),
		startCell: fromJS(startCell),
	};
}

exports = module.exports = {
	DEFAULT_COLORS,
	quintroSpecFromGrid,
};
