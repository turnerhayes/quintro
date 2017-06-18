import {
	capitalize
}                     from "lodash";
import React          from "react";
import PropTypes      from "prop-types";
import { withRouter } from "react-router";
import { connect }    from "react-redux";
import Board          from "project/scripts/components/Board";
import GameRecord     from "project/scripts/records/game";
import GameClient     from "project/scripts/utils/game-client";
import {
	getGame
}                     from "project/scripts/redux/actions";
import                     "project/styles/play-game.less";

class PlayGame extends React.Component {
	static propTypes = {
		gameName: PropTypes.string,
		game: PropTypes.instanceOf(GameRecord),
		getGameError: PropTypes.object,
		dispatch: PropTypes.func.isRequired
	}

	componentWillMount() {
		if (this.props.game) {
			this.joinGame();
		}
		else {
			this.props.dispatch(getGame({ gameName: this.props.gameName }));
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.game && !this.gameJoined) {
			this.joinGame(nextProps.game);
		}
	}

	joinGame = (game = this.props.game) => {
		if (!game) {
			return;
		}

		GameClient.joinGame({
			gameName: game.name
		});

		this.gameJoined = true;
	}

	handleCellClick = ({ position, cell }) => {
		if (this.props.game.winner || (cell && cell.color)) {
			return;
		}

		GameClient.placeMarble({
			gameName: this.props.game.name,
			position
		});
	}

	renderBoard = () => {
		const myTurn = this.props.game.me && this.props.game.me.color === this.props.game.currentPlayerColor;
		const gameIsOver = !!this.props.game.winner;

		return (
			<div
				className={`c_game ${gameIsOver ? "game-over" : ""}`}
			>
				<ul
					className="c_game--color-indicators"
				>
					{
						this.props.game.players.map(
							(player) => {
								const active = player.color === this.props.game.currentPlayerColor;
								return (
									<li
										key={player.color}
										className={`c_game--color-indicators--item ${active ? "active": ""} ${player.isMe ? "current-player" : ""}`}
									>
										<div
											className={`marble ${player.color}`}
										/>
									</li>
								);
							}
						).toList().sortBy((player) => player.order).toArray()
					}
					{
						[
							...Array(
								Math.max(
									this.props.game.playerLimit - this.props.game.players.size,
									0
								)
							)
						].map(
							(val, index) => (
								<li
									key={`not-filled-player-${index}`}
									className={`c_game--color-indicators--item`}
									title="This spot is open for another player"
								>
									<div
										className={`marble not-filled`}
									/>
								</li>
							)
						)
					}
				</ul>
				{
					gameIsOver && (
						<div
							className="c_game--winner-banner"
						>
							<div
								className="c_game--winner-banner--win-message"
							>{capitalize(this.props.game.winner)} wins!</div>
						</div>
					)
				}
				<Board
					board={this.props.game.board}
					allowPlacement={myTurn && !gameIsOver}
					gameIsOver={gameIsOver}
					onCellClick={this.handleCellClick}
				/>
			</div>
		);
	}

	render() {
		if (this.props.getGameError) {
			return (
				<div>
				Error loading the game
				</div>
			);
		}

		if (!this.props.game) {
			return null;
		}

		return this.renderBoard();
	}
}

export default withRouter(
	connect(
		function mapStateToProps(state, ownProps) {
			const props = {};
			const games = state.get("games");
			const game = games && games.items.get(ownProps.gameName);

			if (games.getGameError) {
				props.getGameError = games.getGameError;
			}
			else {
				props.game = game;
			}

			return props;
		}
	)(PlayGame)
);
