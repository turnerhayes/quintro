'use client';

import React, {useCallback} from "react";
import { List, fromJS }         from "immutable";
// import range              from "lodash/range";
// import { withStyles }     from "@mui/material/styles";
import classnames         from "classnames";

// import BoardRecord        from "@shared-lib/board";
import CellComponent               from "./Cell";
import { Board, Cell, Quintro } from "@shared/board";

const styles = {
	root: {
		borderCollapse: "collapse",
		tableLayout: "fixed",
	},
};

interface BoardProps {
	board: Board;
	quintros: Array<Quintro>;
	allowPlacement?: boolean;
	gameIsOver?: boolean;
	onCellClick?: ({cell}: {cell: Cell;}) => void;
	classes?: {
		root: string;
	};
}

function range(limit) {
	return [...Array(limit).keys()];
}

/**
 * Represents a game board, a grid of cells, each of which is potentially
 * filled with a marble of a single color.
 *
 * @class
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
const Board = ({
	board,
	quintros,
	gameIsOver = false,
	allowPlacement = true,
	onCellClick,
	classes = {
		root: "",
	},
}: BoardProps) => {

	/**
	 * Handles a click on a cell.
	 *
	 * @function
	 * @param {object} args - the function arguments
	 * @param {string} [args.cell] - the color of the marble currently in the cell, if any
	 * @param {Types.BoardPosition} args.position - the position of the cell clicked
	 * @return {void}
	 */
	const handleCellClick = useCallback(({ cell }) => {
		if (onCellClick) {
				onCellClick({
				cell
			});
		}
	}, [onCellClick]);

	let quintrosCells = gameIsOver ?
		quintros.reduce(
			(cells, quintro) => {
				quintro.cells.forEach(
					cell => cells[JSON.stringify(cell.position)] = true
				);

				return cells;
			},
			{}
		) : null;

	const filledMap = board.filledCells.reduce(
		(filledCells, cell) => {
			const stringPosition = JSON.stringify(cell.position);

			filledCells[stringPosition] = {
				...cell,
				isQuintroMember: quintros && !!quintros[stringPosition]
			};

			return filledCells;
		},
		{}
	);

	return (
		<table
			className={classnames([
				classes.root,
				{
					"allow-placement": allowPlacement,
				},
			])}
		>
			<tbody>
				{
					range(board.height).map(
						(rowIndex) => (
							<tr
								key={rowIndex}
							>
								{
									range(board.width).map(
										(columnIndex) => {
											const position = [columnIndex, rowIndex];
											const filledCells = filledMap[JSON.stringify(position)];

											return (
												<CellComponent
													key={`${columnIndex}-${rowIndex}`}
													cell={filledCells || fromJS({
														position,
													})}
													allowPlacement={allowPlacement && !filledCells}
													onClick={handleCellClick}
													classes={{
														cell: 'cell',
														marble: 'marble',
														allowPlacement: 'allowPlacement',
														noPlacement: 'noPlacement',
														quintroMember: 'quintroMember',
													}}
												/>
											);
										}
									)
								}	
							</tr>
						)
					)
				}
			</tbody>
		</table>
	);
}

export default Board;
