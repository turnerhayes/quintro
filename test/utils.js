/**
 * Utilities to make it easier to set up and run unit tests.
 *
 * @namespace utils
 * @memberof test
 */

// Ensure that config can be initialized correctly
if (!global.document) {
	global.document = {};
}
const Config = require("../shared-lib/config");
const Board  = require("../shared-lib/board");


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
 * @return {{board: shared-lib.Board, startCell: Types.Cell}} the board and start cell parsed from the
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
		startCell
	};
}

/**
 * Generates a graphical representation of a board.
 *
 * This is essentially the inverse of {@link test.utils.quintroSpecFromGrid};
 * given a {@link shared-lib.Board}, it generates a grid string in the format
 * described in `quintroSpecFromGrid`.
 *
 * @memberof test.utils
 *
 * @param {object} args - the function arguments
 * @param {shared-lib.Board} args.board - the board to represent
 * @param {string[]} [args.colors] - an array of color names to indicate the
 *	colors in the filled cells on the board and their correct turn order
 *
 * @return {{colors: string[], grid: string}} the string representation of the
 *	board (with the key `grid`) and the colors used in the board in their correct
 *	turn order (with the key `colors`)
 */
function boardGraphicalRepresentation({
	board,
	startCell,
	colors,
}) {
	const separator = " ";

	if (!colors) {
		let foundColors = {};

		colors = board.filledCells.reduce(
			(colors, cell) => {
				if (!foundColors[cell.color]) {
					colors.push(cell.color);
					foundColors[cell.color] = true;
				}

				return colors;
			},
			[]
		);

		foundColors = undefined;
	}

	const filledMap = board.filledCells.reduce(
		(filled, filledCell) => {
			const [column, row] = filledCell.position;
			filled[`${column},${row}`] = {
				color: filledCell.color
			};

			return filled;
		},
		{}
	);

	return {
		colors,
		grid: [...new Array(board.height)].map(
			(nothing, rowIndex) => [...new Array(board.width)].map(
				(nothing, columnIndex) => {
					const filledMapCell = filledMap[`${columnIndex},${rowIndex}`];
					if (filledMapCell) {
						const colorIndex = colors.indexOf(filledMapCell.color);

						if (
							startCell && startCell.position[0] === columnIndex &&
								startCell.position[1] === rowIndex
						) {
							return `^${colorIndex + 1}`;
						}

						return ` ${colorIndex + 1}`;
					}

					return " -";
				}
			).join(separator)
		).join("\n")
	};
}

exports = module.exports = {
	quintroSpecFromGrid,
	boardGraphicalRepresentation
};
