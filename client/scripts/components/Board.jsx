import { range }          from "lodash";
import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import                         "project/styles/board.less";

class Board extends React.Component {
	static propTypes = {
		board: ImmutablePropTypes.map.isRequired,
		onCellClick: PropTypes.func
	}

	handleCellClick = ({ cell, position }) => {
		this.props.onCellClick && this.props.onCellClick({
			cell,
			position
		});
	}

	render() {
		return (
			<table className="c_game_board">
				<tbody>
				{
					range(this.props.board.get("height")).map(
						(rowIndex) => (
							<tr className="board-row" key={rowIndex}>
							{
								range(this.props.board.get("width")).map(
									(columnIndex) => {
										const filled = this.props.board.get("filled")[JSON.stringify([columnIndex, rowIndex])];

										return (
											<td
												key={`${columnIndex}-${rowIndex}`}
												className={`board-cell ${filled ? "filled": ""}`}
												onClick={() => this.handleCellClick({
													cell: filled,
													position: [columnIndex, rowIndex]
												})}
											>
												{
													filled ? (
														<div className={`marble ${filled.get("color")}`}></div>
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
