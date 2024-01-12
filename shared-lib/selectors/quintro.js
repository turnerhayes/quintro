"use strict";

const assert = require("assert");
const { Set, Map, List, fromJS, is } = require("immutable");
const { createSelector } = require("reselect");

const Quintro = require("../quintro");

const QUINTRO_LENGTH = 5;

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
function _findPotentialQuintros({
	columnDelta,
	rowDelta,
	filledMap,
	startCell,
	board,
	noEmptyCells,
}) {
	const color = startCell.get("color");
	const [column, row] = startCell.get("position").toArray();
	let quintros = Set();
	const width = board.get("width");
	const height = board.get("height");

	

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
		let offset = QUINTRO_LENGTH - 1;
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
		const frameEndColumn = columnDelta === 0 ? column : i + (columnDelta * (QUINTRO_LENGTH - 1));
		const frameEndRow = rowDelta === 0 ? row : j + (rowDelta * (QUINTRO_LENGTH - 1));

		if (
			i < 0 || i >= width || j < 0 || j >= height ||
			frameEndColumn >= width ||
			frameEndRow >= height
		) {
			continue;
		}

		for (
			;
			(
				columnDelta === 0 ||
				(
					i >= 0 &&
					i < width &&
					i <= frameEndColumn
				)
			) &&
			(
				rowDelta === 0 ||
				(
					j >= 0 && j < height && (
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
				i >= 0 && j >= 0 && i < width && j < height &&
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
				potentialQuintro.length > QUINTRO_LENGTH &&
				(
					// There are blank cells on one or both ends; trim if possible
					firstNonEmptyIndex > 0 ||
					lastNonEmptyIndex < potentialQuintro.length - 1
				)
			) {

				// Take frames starting from each empty cell at the start
				// We need to make sure to include the last non-empty cell in the quintro,
				// so start iteration QUINTRO_LENGTH cells from the last non-empty cell
				for (let i = lastNonEmptyIndex - (QUINTRO_LENGTH - 1); i >= 0 && i < firstNonEmptyIndex; i++) {
					quintro = potentialQuintro.slice(i, i + QUINTRO_LENGTH);
				}

				// Now do the same for empty cells at the end
				for (
					// Start in one from the end, because we're trimming from the end
					// eslint-disable-next-line no-magic-numbers
					let i = potentialQuintro.length - 2;
					i >= lastNonEmptyIndex &&
					i - (QUINTRO_LENGTH - 1) <= firstNonEmptyIndex && i >= (QUINTRO_LENGTH - 1);
					i--
				) {
					quintro = potentialQuintro.slice(i - (QUINTRO_LENGTH - 1), i + 1);
				}
			}
			else if (
				potentialQuintro.length >= QUINTRO_LENGTH
			) {
				quintro = potentialQuintro;
			}

			if (quintro && (!noEmptyCells || quintro.filter((cell) => !cell.color).length === 0)) {
				quintros = quintros.add(new Quintro({ cells: quintro }));
				
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
 * @param {external:Immutable.Map<Types.BoardPositionImmutable, string>} args.filledMap - an object
 *	that maps a cell position (in the form of `<column index>,<row index>`) to a string
 *	representing a color; this lists all the filled cells on the board in an easily accessed way.
 * @param {boolean} [args.noEmptyCells] - if true, any potential quintros that contain an empty
 *	cell are ignored.
 *
 * @return {external:Immutable.Set<shared-lib.Quintro>} a set of found quintros along all axes
 */
function _findAllPotentialQuintrosForCell({
	startCell,
	board,
	filledMap,
	noEmptyCells,
}) {
	startCell = fromJS(startCell);	
	
	// Horizontal quintros
	const horizontal = _findPotentialQuintros({
		startCell,
		board,
		filledMap,
		noEmptyCells,
		columnDelta: 1,
		rowDelta: 0,
	});

	// Vertical quintros
	const vertical = _findPotentialQuintros({
		startCell,
		board,
		filledMap,
		noEmptyCells,
		columnDelta: 0,
		rowDelta: 1,
	});

	// Top left to bottom right quintros
	const topLeft = _findPotentialQuintros({
		startCell,
		board,
		filledMap,
		noEmptyCells,
		columnDelta: 1,
		rowDelta: 1,
	});

	// Top right to bottom left quintros
	const topRight = _findPotentialQuintros({
		startCell,
		board,
		filledMap,
		noEmptyCells,
		columnDelta: 1,
		rowDelta: -1,
	});

	return horizontal.union(vertical, topLeft, topRight);
}

const getFilledMap = (state) => {
	return state.get("filledCells", List()).reduce(
		(cellMap, cell) => {
			return cellMap.set(cell.get("position"), cell.get("color"));
		},
		Map()
	);
};

const getLastPlacedCell = (state) => {
	return state.get("filledCells", List()).last();
};

const getQuintrosForCell = createSelector(
	[
		getFilledMap,
		(state) => state,
		(state, { startCell }) => startCell,
	],
	(filledMap, board, startCell) => {
		// bail early if no filled cells
		if (filledMap.isEmpty()) {
			return Set();
		}

		startCell = fromJS(startCell);

		const quintros = _findAllPotentialQuintrosForCell({
			filledMap,
			board,
			startCell,
			noEmptyCells: true,
		});

		return quintros;
	}
);

const getQuintros = (state) => getQuintrosForCell(
	state,
	{
		startCell: getLastPlacedCell(state),
	}
);

/**
 * Finds all potential sequences of cells that could become a quintro if all empty cells
 *	(assuming there are any) are filled with a single color.
 *
 * @return {external:Immutable.Set<shared-lib.Quintro>} the (potential) quintros
 */
const getAllPotentialQuintros = createSelector(
	(state) => state,
	getFilledMap,
	(board, filledMap) => {
		return filledMap.reduce(
			(allQuintros, color, position) => {
				return allQuintros.union(
					_findAllPotentialQuintrosForCell({
						startCell: {
							position,
							color,
						},
						filledMap,
						board,
						noEmptyCells: false,
					})
				);
			},
			Set()
		);
	}
);

/**
 * Finds all potential sequences of cells that could become a quintro if all empty cells
 *	(assuming there are any) are filled with a single color. Any returned potential quintro
 *	must include the startCell
 *
 * @param {Object} args - the function arguments
 * @param {Types.Cell|external:Immutable.Map<Types.Cell>} args.startCell - the cell around which to look for potential quintros
 *
 * @return {external:Immutable.Set<shared-lib.Quintro>} the (potential) quintros
 */
const getPotentialQuintros = createSelector(
	(state) => state,
	getFilledMap,
	(state, { startCell }) => startCell,
	(board, filledMap, startCell) => {
		assert(startCell, "Parameter `startCell` for `getPotentialQuintros()` is required");

		return _findAllPotentialQuintrosForCell({
			board,
			startCell,
			filledMap,
			noEmptyCells: false,
		});
	}
);

/**
 * Calculates the difference in potential quintros that would result if `newCell` is filled in.
 *
 * @return {external:Immutable.Map<{added: external:Immutable.Set<shared-lib.Quintro>, removed: external:Immutable.Set<shared-lib.Quintro>, changed: external:Immutable.Set<shared-lib.Quintro>}>} the changes to the set of quintros
 */
const getPotentialQuintroDelta = createSelector(
	(state) => state,
	(state, props) => props.newCell,
	(state, newCell) => {
		newCell = fromJS(newCell);
	
		const initialQuintros = getAllPotentialQuintros(state).filter(
			(quintro) => quintro.containsCell({ position: newCell.get("position") })
		);
	
		const quintrosWithNewCell = getPotentialQuintros(
			state.update("filledCells", (filledCells) => filledCells.push(newCell)),
			{ startCell: newCell }
		);
	
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
					// istanbul ignore else
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
);

exports = module.exports = {
	getQuintrosForCell,
	getQuintros,
	getAllPotentialQuintros,
	getPotentialQuintros,
	getPotentialQuintroDelta,
};
