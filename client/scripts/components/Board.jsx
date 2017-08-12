import { range }   from "lodash";
import React       from "react";
import PropTypes   from "prop-types";
import classnames  from "classnames";
import BoardRecord from "project/shared-lib/board";
import                  "project/styles/board.less";

class Board extends React.Component {
	static propTypes = {
		board: PropTypes.instanceOf(BoardRecord).isRequired,
		allowPlacement: PropTypes.bool,
		gameIsOver: PropTypes.bool,
		enableBackgroundImage: PropTypes.bool,
		onCellClick: PropTypes.func,
	}

	handleCellClick = ({ cell, position }) => {
		this.props.onCellClick && this.props.onCellClick({
			cell,
			position
		});
	}

	render() {
		let quintros;

		if (this.props.gameIsOver) {
			quintros = this.props.board.getQuintros();

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

		const filledMap = this.props.board.filledCells.reduce(
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
			<table className={classnames(
				"c_game_board",
				{
					"allow-placement": this.props.allowPlacement,
					"with-background-image": this.props.enableBackgroundImage
				}
			)}>
				<tbody>
				{
					range(this.props.board.height).map(
						(rowIndex) => (
							<tr className="board-row" key={rowIndex}>
							{
								range(this.props.board.width).map(
									(columnIndex) => {
										const position = [columnIndex, rowIndex];
										const filled = filledMap[JSON.stringify(position)];

										return (
											<td
												key={`${columnIndex}-${rowIndex}`}
												className={
													classnames(
														"board-cell",
														{
															filled,
															"quintro-member": filled && filled.isQuintroMember,
														}
													)
												}
												onClick={() => this.handleCellClick({
													cell: filled,
													position
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
