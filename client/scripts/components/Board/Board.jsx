import { range }    from "lodash";
import React        from "react";
import PropTypes    from "prop-types";
import createHelper from "project/scripts/components/class-helper";
import BoardRecord  from "project/shared-lib/board";
import                   "./Board.less";

const classes = createHelper("game-board");

/**
 * @callback client.react-components.Board~onCellClickCallback
 *
 * @param {object} args - the callback arguments
 * @param {Types.Cell} [args.cell] - the cell clicked
 * @return {void}
 */

/**
 * Represents a game board, a grid of cells, each of which is potentially
 * filled with a marble of a single color.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class Board extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {shared-lib.Board} board - the board object backing this component
	 * @prop {boolean} [allowPlacement] - whether to permit placing a marble on the board
	 * @prop {client.react-components.Board~onCellClickCallback} [onCellClick] - handler called when a cell is clicked
	 */
	static propTypes = {
		board: PropTypes.instanceOf(BoardRecord).isRequired,
		allowPlacement: PropTypes.bool,
		gameIsOver: PropTypes.bool,
		onCellClick: PropTypes.func,
	}

	/**
	 * Handles a click on a cell.
	 *
	 * @function
	 * @param {object} args - the function arguments
	 * @param {string} [args.cell] - the color of the marble currently in the cell, if any
	 * @param {Types.BoardPosition} args.position - the position of the cell clicked
	 * @return {void}
	 */
	handleCellClick = ({ cell }) => {
		this.props.onCellClick && this.props.onCellClick({
			cell
		});
	}

	/**
	 * Renders the component.
	 *
	 * @return {!external:React.Component} the component as a React component tree
	 */
	render() {
		const {
			board,
			gameIsOver,
			allowPlacement,
		} = this.props;

		let quintros;

		if (gameIsOver) {
			quintros = board.getQuintros();

			if (quintros) {
				quintros = quintros.reduce(
					(cells, quintro) => {
						quintro.cells.forEach(
							cell => cells[JSON.stringify(cell.get("position"))] = true
						);

						return cells;
					},
					{}
				);
			}
		}

		const filledMap = board.filledCells.reduce(
			(filled, cell) => {
				const stringPosition = JSON.stringify(cell.get("position"));
				cell = cell.toJS();

				cell.isQuintroMember = quintros && !!quintros[stringPosition];

				filled[stringPosition] = cell;

				return filled;
			},
			{}
		);

		return (
			<table
				{...classes({
					extra: [
						allowPlacement && "allow-placement",
					],
				})}
			>
				<tbody>
				{
					range(board.height).map(
						(rowIndex) => (
							<tr
								key={rowIndex}
								{...classes({
									element: "board-row",
								})}
							>
							{
								range(this.props.board.width).map(
									(columnIndex) => {
										const position = [columnIndex, rowIndex];
										const filled = filledMap[JSON.stringify(position)];

										return (
											<td
												key={`${columnIndex}-${rowIndex}`}
												{...classes({
													element: "board-cell",
													extra: [
														filled && "filled",
														filled && filled.isQuintroMember && "quintro-member",
													],
												})}
												onClick={() => this.handleCellClick({
													cell: filled || {
														position
													},
												})}
											>
												{
													filled ? (
														<div className={`marble ${filled.color}`}></div>
													) : null
												}
											</td>
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
}

export default Board;
