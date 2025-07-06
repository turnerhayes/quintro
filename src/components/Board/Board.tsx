import { useCallback }              from "react";
import classnames         from "classnames";

import {Cell as CellComponent}               from "./Cell";
import { type CellWithQuintroStatus } from "./Cell/Cell";
import type { Board as BoardType, Quintro } from "@/types";
import styles from "./Board.module.css";


const range = (max: number) => {
	return [...Array(max)].map((_, index) => index);
};

export interface BoardProps {
	board: BoardType;
	quintros: Quintro[];
	gameIsOver: boolean;
	allowPlacement: boolean;
	onCellClick?: (args: {cell: CellWithQuintroStatus;}) => void;
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
export const Board = (
	{
		board,
		quintros,
		gameIsOver,
		allowPlacement,
		onCellClick,
	}: BoardProps
) => {
	/**
	 * Handles a click on a cell.
	 *
	 * @function
	 * @param {object} args - the function arguments
	 * @param {string} [args.cell] - the color of the marble currently in the cell, if any
	 * @param {Types.BoardPosition} args.position - the position of the cell clicked
	 * @return {void}
	 */
	const handleCellClick = useCallback((
		{
			cell,
		}: {
			cell: CellWithQuintroStatus;
		}
	) => {
		onCellClick && onCellClick({
			cell
		});
	}, [
		onCellClick,
	]);

	let quintroCells: Record<string, boolean>|undefined;

	if (gameIsOver) {
		quintroCells = quintros.reduce(
			(cells, quintro) => {
				quintro.cells.forEach(
					cell => cells[JSON.stringify(cell.position)] = true
				);

				return cells;
			},
			{} as Record<string, boolean>
		);
	}

	const filledMap = board.filledCells.reduce(
		(filledCells, cell) => {
			const stringPosition = JSON.stringify(cell.position);

			filledCells[stringPosition] = {
				...cell,
				isQuintroMember: Boolean(quintroCells && !!quintroCells[stringPosition]),
			};

			return filledCells;
		},
		{} as Record<string, CellWithQuintroStatus>
	);

	return (
		<table
			className={classnames([
				styles.root,
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
											const filledCell = filledMap[JSON.stringify(position)];

											return (
												<CellComponent
													key={`${columnIndex}-${rowIndex}`}
													cell={filledCell || {
														position,
													}}
													allowPlacement={allowPlacement && !filledCell}
													onClick={handleCellClick}
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
