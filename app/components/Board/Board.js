import React              from "react";
import PropTypes          from "prop-types";
import { fromJS }         from "immutable";
import range              from "lodash/range";
import ImmutablePropTypes from "react-immutable-proptypes";
import createHelper       from "@app/components/class-helper";
import Cell               from "./Cell";
import                         "./Board.less";

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
 * @class
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class Board extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {external:Immutable.Map} board - the map representing the board object backing this component
	 * @prop {boolean} [allowPlacement] - whether to permit placing a marble on the board
	 * @prop {client.react-components.Board~onCellClickCallback} [onCellClick] - handler called when a cell is clicked
	 */
	static propTypes = {
		board: ImmutablePropTypes.map.isRequired,
		quintros: ImmutablePropTypes.set,
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
			quintros = this.props.quintros.reduce(
				(cells, quintro) => {
					quintro.forEach(
						cell => cells[JSON.stringify(cell.get("position"))] = true
					);

					return cells;
				},
				{}
			);
		}

		const filledMap = board.get("filled").reduce(
			(filled, cell) => {
				const stringPosition = JSON.stringify(cell.get("position"));

				filled[stringPosition] = cell.set("isQuintroMember", quintros && !!quintros[stringPosition]);

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
						range(board.get("height")).map(
							(rowIndex) => (
								<tr
									key={rowIndex}
									{...classes({
										element: "board-row",
									})}
								>
									{
										range(board.get("width")).map(
											(columnIndex) => {
												const position = [columnIndex, rowIndex];
												const filled = filledMap[JSON.stringify(position)];

												return (
													<Cell
														key={`${columnIndex}-${rowIndex}`}
														cell={filled || fromJS({
															position,
														})}
														allowPlacement={allowPlacement}
														onClick={this.handleCellClick}
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
}

export default Board;
