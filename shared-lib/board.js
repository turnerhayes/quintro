"use strict";

const assert  = require("assert");
const {
	Set,
	OrderedSet,
	Map,
	List,
	Record,
	fromJS,
	is,
	Collection
}             = require("immutable");
const Quintro = require("./quintro");

const schema = {
	width: null,
	height: null,
	filledCells: List(),
};

/**
 * Represents the state of a game board.
 *
 * @memberof shared-lib
 * @extends external:Immutable.Record
 */
class Board extends Record(schema, "Board") {
	/**
	 * @param {Object} args - the constructor arguments
	 * @param {!number} args.width - the width of the board, in cells (must be an integer)
	 * @param {!number} args.height - the height of the board, in cells (must be an integer)
	 * @param {Types.Cell[]|external:Immutable.Collection.Indexed<Types.Cell>} args.filledCells - the currently occupied cells in the board
	 */
	constructor({
		width,
		height,
		filledCells=[]
	}) {
		assert.ok(Number.isInteger(width), "`width` must be an integer; was " + width);
		assert.ok(width > 0, "`width` must be greater than 0; was " + width);
		assert.ok(Number.isInteger(height), "`height` must be an integer; was " + height);
		assert.ok(height > 0, "`height` must be greater than 0; was " + height);
		assert.ok(
			Array.isArray(filledCells) || filledCells instanceof Collection.Indexed,
			"`filledCells` must be an array or an indexed Immutable collection; was " + filledCells
		);

		/**
		 * The width of the board, in cells
		 *
		 * @member {number} width
		 * @memberof shared-lib.Board
		 */
		
		/**
		 * The height of the board, in cells
		 *
		 * @member {number} height
		 * @memberof shared-lib.Board
		 */
		
		/**
		 * The currently occupied cells in the board
		 *
		 * @member {external:Immutable.List<Types.Cell>} filledCells
		 * @memberof shared-lib.Board
		 */

		super({
			width,
			height,
			filledCells: List(fromJS(filledCells))
		});
	}

	getPlayerColors() {
		return this.filledCells.reduce(
			(colors, cell) => {
				return colors.add(cell.get("color"));
			},
			OrderedSet()
		).toList();
	}

	toString() {
		const filledSummary = this.filledCells.map(
			(cell) => `${cell.get("position").get(0)},${cell.get("position").get(1)}:${cell.get("color")}`
		).join("; ");

		return `Board<${this.width}x${this.height}, filled: ${filledSummary}>`;
	}

	toGraphicalString({
		startCell,
		playerColors = this.getPlayerColors(),
	} = {}) {
		const separator = " ";

		playerColors = List(playerColors);
		startCell = startCell ? fromJS(startCell) : undefined;

		const filledMap = this.filledCells.reduce(
			(filled, filledCell) => {
				return filled.set(List(filledCell.get("position")), filledCell.get("color"));
			},
			Map()
		);

		const legend = playerColors.map(
			(color, index) => `${index}: ${color}`
		).join("\n");

		const grid = [...new Array(this.height)].map(
			(nothing, rowIndex) => [...new Array(this.width)].map(
				(nothing, columnIndex) => {
					const filledMapCell = filledMap.get(List([columnIndex, rowIndex]));

					if (filledMapCell) {
						const colorIndex = playerColors.indexOf(filledMapCell);

						if (
							startCell && startCell.getIn(["position", 0]) === columnIndex &&
								startCell.getIn(["position", 1]) === rowIndex
						) {
							return `^${colorIndex}`;
						}

						return ` ${colorIndex}`;
					}

					return " -";
				}
			).join(separator)
		).join("\n");

		return `${legend ? legend + "\n\n" : ""}${grid}
`;
	}

	/**
	 * Returns an instance of {shared-lib.Board} with the specified cells added to the
	 * `filledCells` property.
	 *
	 * @param {...Type.Cell|external:Immutable.Map<Type.Cell>} cells - the cells to use for the `filledCells` property
	 *
	 * @return {shared-lib.Board} a Board instance with the cells added
	 */
	fillCells(...cells) {
		return this.updateIn(
			["filledCells"],
			(filled) => filled.push(...cells.map(fromJS))
		);
	}

	/**
	 * Gets information about the cell at the specified coordinates.
	 *
	 * @param {Types.BoardPosition|Types.BoardPositionImmutable} position - the position of the cell to get
	 *
	 * @return {external:Immutable.Map<{position: Types.BoardPositionImmutable, color: string}>} the cell information
	 */
	getCell(position) {
		assert.ok(
			position[0] < this.width && position[0] >= 0,
			`Column index must be within the board; column index was ${position[0]}, board width was ${this.width}`
		);
		assert.ok(
			position[1] < this.height && position[1] >= 0,
			`Row index must be within the board; row index was ${position[0]}, board height was ${this.height}`
		);

		position = List(position);
		const filled = this.filledCells.find((cell) => is(cell.get("position"), position));

		return Map({
			position,
			color: filled && filled.get("color"),
		});
	}

	/**
	 * Creates an object that maps cell positions to colors for filled cells.
	 *
	 * @private
	 *
	 * @return {external:Immutable.Map<Types.BoardPositionImmutable, string>} a map from cell positions to colors.
	 *	Cells that are empty are not included in the map.
	 */
	getFilledMap() {
		return this.filledCells.reduce(
			(map, cell) => {
				return map.set(cell.get("position"), cell.get("color"));
			},
			Map()
		);
	}

	/**
	 * Finds all potential quintros along any one axis (horizontal, vertical and both diagonals).
	 *
	 * @private
	 *
	 * @param {Object} args - the function arguments
	 * @param {!number} args.columnDelta - the amount and direction the column index should change
	 *	with each step in the board traversal. Can be `-1`, `0`, or `1`.
	 * @param {!number} args.rowDelta - the amount and direction the row index should change
	 *	with each step in the board traversal. Can be `-1`, `0`, or `1`. For example, to check the horizontal axis, `columnDelta`
	 *	should be `1` and `rowDelta` should be `0`. To check the top-right to bottom-left diagonal axis,
	 *	`columnDelta` should be `1` and `rowDelta` should be `-1` (or vice versa).
	 * @param {external:Immutable.Map<Types.Cell>} args.startCell - the cell around which to look for potential quintros
	 * @param {external:Immutable.Map<Types.BoardPositionImmutable, string>} args.filledMap - a map from cell position to a
	 *	string representing a color.
	 * @param {boolean} args.noEmptyCells - if true, any potential quintros that contain an empty
	 *	cell are ignored.
	 *
	 * @return {external:Immutable.Set<shared-lib.Quintro>} a set of found quintros
	 */
	_findPotentialQuintros({
		columnDelta,
		rowDelta,
		filledMap,
		startCell,
		noEmptyCells,
	}) {
		const color = startCell.get("color");
		const [column, row] = startCell.get("position");
		let quintros = Set();

		/*
			The approach here is using a series of "frames" along the chosen axis, centered around
			the start cell. So for example, take the following board state:

				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  d  -  -  -  c  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
		
			In order to find the potential horizontal quintros for the filled cell (marked with "c"; dashes
			are empty cells), we look at 5 "frames":

				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  - (d  -  -  -  c) -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -

				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  d (-  -  -  c  -  )
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -

				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  d  - (-  -  c  -    )
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -

				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  d  -  - (-  c  -      )
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -

				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  d  -  -  - (c  -        )
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -
				-  -  -  -  -  -  -  -  -  -  -

			We can automatically discard those frames that go off any edge of the board. Any
			frame that includes cell that already has another color (like the one marked "d")
			can also be discarded, as with the first frame above.

			We then need to add on any cells on either end of the frame that are already filled
			with the same color; if we were to fill in the entire frame with the color, then
			those  will become part of the quintro.

			Finally, if the set of cells we've assembled up to this point is not long enough to
			be a quintro, then we add adjacent empty cells until we a) reach an edge of the board
			or b) reach a cell filled with another color.

			If the set of cells is long enough now, then we add it to the final set of quintros.
		*/
		for (
			let offset = Quintro.QUINTRO_LENGTH - 1;
			offset >= 0;
			offset--
		) {
			let potentialQuintro = [];
			let i = column, j = row;

			if (columnDelta !== 0) {
				// Find the start column for this frame
				i -= columnDelta * offset;
			}

			if (rowDelta !== 0) {
				// Find the start row for this frame
				j -= rowDelta * offset;
			}

			// Calculate the end of the frame; for positive columnDelta, the frame starts
			// behind the start column, at column - 4, then advances one cell each time
			// the offset increases. For negative columnDelta, the frame starts ahead of
			// the start column, at column + 4, and retreats one cell each time the offset
			// increases. Similarly for rowDelta are the start row.
			const frameEndColumn = columnDelta === 0 ? column : i + (columnDelta * (Quintro.QUINTRO_LENGTH - 1));
			const frameEndRow = rowDelta === 0 ? row : j + (rowDelta * (Quintro.QUINTRO_LENGTH - 1));

			if (
				i < 0 || i >= this.width || j < 0 || j >= this.height ||
				frameEndColumn >= this.width ||
				frameEndRow >= this.height
			) {
				continue;
			}

			for (
				;
				(
					columnDelta === 0 ||
					(i >= 0 && i < this.width && (
						columnDelta > 0 ?
							i <= frameEndColumn :
							i >= frameEndColumn
					)
					)
				) &&
				(
					rowDelta === 0 ||
					(
						j >= 0 && j < this.height && (
							rowDelta > 0 ?
								j <= frameEndRow :
								j >= frameEndRow
						)
					)
				);
				i += columnDelta, j += rowDelta
			) {
				const currentCellColor = filledMap.get(List([i, j]));

				if (currentCellColor && currentCellColor !== color) {
					break;
				}

				potentialQuintro.push({
					position: [i, j],
					color: currentCellColor
				});
			}

			if (potentialQuintro.length > 0) {
				const [firstCellColumn, firstCellRow] = potentialQuintro[0].position;

				for (
					let i = firstCellColumn - columnDelta,
						j = firstCellRow - rowDelta;
					i >= 0 && j >= 0 && filledMap.get(List([i, j])) === color;
					i -= columnDelta, j -= rowDelta
				) {
					potentialQuintro.unshift({
						position: [i, j],
						color
					});
				}

				const [lastCellColumn, lastCellRow] = potentialQuintro[potentialQuintro.length - 1].position;

				for (
					let i = lastCellColumn + columnDelta,
						j = lastCellRow + rowDelta;
					i >= 0 && j >= 0 && i < this.width && j < this.height &&
						filledMap.get(List([i, j])) === color;
					i += columnDelta, j += rowDelta
				) {
					potentialQuintro.push({
						position: [i, j],
						color
					});
				}

				let firstNonEmptyIndex = 0, lastNonEmptyIndex = potentialQuintro.length - 1;

				for (let i = firstNonEmptyIndex; i < potentialQuintro.length; i++) {
					if (potentialQuintro[i].color) {
						firstNonEmptyIndex = i;
						break;
					}
				}

				for (let i = lastNonEmptyIndex; i >= 0; i--) {
					if (potentialQuintro[i].color) {
						lastNonEmptyIndex = i;
						break;
					}
				}

				let quintro;

				if (
					// Potential quintro is longer than necessary
					potentialQuintro.length > Quintro.QUINTRO_LENGTH &&
					(
						// There are blank cells on one or both ends; trim if possible
						firstNonEmptyIndex > 0 ||
						lastNonEmptyIndex < potentialQuintro.length - 1
					)
				) {

					// Take frames starting from each empty cell at the start
					// We need to make sure to include the last non-empty cell in the quintro,
					// so start iteration Quintro.QUINTRO_LENGTH cells from the last non-empty cell
					for (let i = lastNonEmptyIndex - (Quintro.QUINTRO_LENGTH - 1); i >= 0 && i < firstNonEmptyIndex; i++) {
						quintro = new Quintro({
							cells: potentialQuintro.slice(i, i + Quintro.QUINTRO_LENGTH)
						});
					}

					// Now do the same for empty cells at the end
					for (
						// Start in one from the end, because we're trimming from the end
						// eslint-disable-next-line no-magic-numbers
						let i = potentialQuintro.length - 2;
						i >= lastNonEmptyIndex &&
						i - (Quintro.QUINTRO_LENGTH - 1) <= firstNonEmptyIndex && i >= (Quintro.QUINTRO_LENGTH - 1);
						i--
					) {
						quintro = new Quintro({
							cells: potentialQuintro.slice(i - (Quintro.QUINTRO_LENGTH - 1), i + 1)
						});
					}
				}
				else if (
					potentialQuintro.length >= Quintro.QUINTRO_LENGTH
				) {
					quintro = new Quintro({
						cells: potentialQuintro
					});
				}

				if (quintro && (!noEmptyCells || quintro.numberOfEmptyCells === 0)) {
					quintros = quintros.add(quintro);
				}
			}
		}

		return quintros;
	}

	/**
	 * Finds all potential sequences of cells that could become a quintro if all empty cells
	 *	(assuming there are any) are filled with a single color. Any returned potential quintro
	 *	must include the startCell
	 *
	 * @private
	 *
	 * @param {Object} args - the function arguments
	 * @param {external:Immutable.Map<Types.Cell>} args.startCell - the cell around which to look for potential quintros
	 * @param {external:Immutable.Map<Types.BoardPositionImmutable, string>} [args.filledMap=getFilledMap()] - an object
	 *	that maps a cell position (in the form of `<column index>,<row index>`) to a string
	 *	representing a color; this lists all the filled cells on the board in an easily accessed way.
	 * @param {boolean} [args.noEmptyCells] - if true, any potential quintros that contain an empty
	 *	cell are ignored.
	 *
	 * @return {external:Immutable.Set<shared-lib.Quintro>} a set of found quintros along all axes
	 */
	_findAllPotentialQuintrosForCell({
		startCell,
		filledMap,
		noEmptyCells,
	}) {
		if (!filledMap) {
			filledMap = this.getFilledMap();
		}

		startCell = fromJS(startCell);

		// Horizontal quintros
		const horizontal = this._findPotentialQuintros({
			startCell,
			filledMap,
			noEmptyCells,
			columnDelta: 1,
			rowDelta: 0,
		});

		// Vertical quintros
		const vertical = this._findPotentialQuintros({
			startCell,
			filledMap,
			noEmptyCells,
			columnDelta: 0,
			rowDelta: 1,
		});

		// Top left to bottom right quintros
		const topLeft = this._findPotentialQuintros({
			startCell,
			filledMap,
			noEmptyCells,
			columnDelta: 1,
			rowDelta: 1,
		});

		// Top right to bottom left quintros
		const topRight = this._findPotentialQuintros({
			startCell,
			filledMap,
			noEmptyCells,
			columnDelta: 1,
			rowDelta: -1,
		});

		return horizontal.union(vertical, topLeft, topRight);
	}

	/**
	 * Finds all potential sequences of cells that could become a quintro if all empty cells
	 *	(assuming there are any) are filled with a single color.
	 *
	 * @param {Object} [args] - the function arguments
	 * @param {boolean} [args.noEmptyCells] - if true, any potential quintros that contain an empty
	 *	cell are ignored. This effectively gets all existing quintros, and if any are returned, the
	 *	game is over. Generally, you should use [getQuintros()]{@link shared-lib.board.getQuintros} for this.
	 *
	 * @return {external:Immutable.Set<shared-lib.Quintro>} the (potential) quintros
	 */
	getAllPotentialQuintros({
		noEmptyCells,
	} = {}) {
		return this.filledCells.reduce(
			(allQuintros, startCell) => {
				return allQuintros.union(
					this._findAllPotentialQuintrosForCell({
						startCell,
						noEmptyCells,
					})
				);
			},
			Set()
		);
	}

	/**
	 * Finds all potential sequences of cells that could become a quintro if all empty cells
	 *	(assuming there are any) are filled with a single color. Any returned potential quintro
	 *	must include the startCell
	 *
	 * @param {Object} args - the function arguments
	 * @param {Types.Cell|external:Immutable.Map<Types.Cell>} args.startCell - the cell around which to look for potential quintros
	 * @param {boolean} [args.noEmptyCells] - if true, any potential quintros that contain an empty
	 *	cell are ignored. This effectively gets all existing quintros, and if any are returned, the
	 *	game is over. Generally, you should use [getQuintros()]{@link shared-lib.board.getQuintros} for this.
	 *
	 * @return {external:Immutable.Set<shared-lib.Quintro>} the (potential) quintros
	 */
	getPotentialQuintros({
		startCell,
		noEmptyCells,
	}) {
		assert(startCell, "Parameter `startCell` for `getPotentialQuintros()` is required");

		return this._findAllPotentialQuintrosForCell({
			startCell,
			noEmptyCells,
		});
	}

	/**
	 * Finds all currently full quintros that involve the specified `startCell`.
	 *
	 * @param {Object} args - the function arguments
	 * @param {Types.Cell|external:Immutable.Map<Types.Cell>} [args.startCell=last filled cell] - the cell around which to look for quintros
	 *
	 * @return {external:Immutable.Set<shared-lib.Quintro>} the (potential) quintros
	 */
	getQuintros({ startCell = this.filledCells.last() } = {}) {
		return this.getPotentialQuintros({
			startCell,
			noEmptyCells: true
		});
	}

	/**
	 * Calculates the difference in potential quintros that would result if `newCell` is filled in.
	 *
	 * @param {Object} args - the function arguments
	 * @param {Types.Cell|external:Immutable.Map<Types.Cell>} args.newCell - the cell to fill in
	 *
	 * @return {external:Immutable.Map<{added: external:Immutable.Set<shared-lib.Quintro>, removed: external:Immutable.Set<shared-lib.Quintro>, changed: external:Immutable.Set<shared-lib.Quintro>}>} the changes to the set of quintros
	 */
	getPotentialQuintroDelta({
		newCell
	}) {
		newCell = fromJS(newCell);

		const initialQuintros = this.getAllPotentialQuintros().filter(
			(quintro) => quintro.containsCell({ position: newCell.get("position")})
		);

		const quintrosWithNewCell = this.fillCells(
			newCell
		).getPotentialQuintros({
			startCell: newCell
		});

		const added = quintrosWithNewCell.reduce(
			(quintros, quintro) => {
				if (!initialQuintros.find((initQuintro) => initQuintro.cellsAreInSamePositions(quintro))) {
					// Did not find cell in init--this is an added quintro
					return quintros.add(quintro);
				}

				return quintros;
			},
			Set()
		);

		const removed = initialQuintros.reduce(
			(quintros, quintro) => {
				if (!quintrosWithNewCell.find((newQuintro) => newQuintro.cellsAreInSamePositions(quintro))) {
					// Did not find quintro in new quintros--this is a removed quintro
					return quintros.add(quintro);
				}

				return quintros;
			},
			Set()
		);

		const changed = initialQuintros.reduce(
			(quintros, quintro) => {
				const quintroInUpdated = quintrosWithNewCell.find((newQuintro) => newQuintro.cellsAreInSamePositions(quintro));

				if (quintroInUpdated) {
					if (!quintro.equals(quintroInUpdated)) {
						return quintros.add(Map({
							quintro: quintroInUpdated,
							changedCells: quintro.cells.map(
								(cell, index) => {
									const updatedCell = quintroInUpdated.cells.get(index);

									if (!is(updatedCell, cell)) {
										return updatedCell;
									}

									return undefined;
								}
							),
						}));
					}
				}

				return quintros;
			},
			Set()
		);

		return Map({
			added,
			removed,
			changed,
			allContainingQuintros: quintrosWithNewCell
		});
	}
}

exports = module.exports = Board;
