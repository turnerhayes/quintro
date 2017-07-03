import {
	capitalize
}                       from "lodash";
import React            from "react";
import PropTypes        from "prop-types";
import { withRouter }   from "react-router";
import { connect }      from "react-redux";
import Board            from "project/scripts/components/Board";
import PlayerIndicators from "project/scripts/components/PlayerIndicators";
import GameRecord       from "project/scripts/records/game";
import GameClient       from "project/scripts/utils/game-client";
import {
	getGame
}                       from "project/scripts/redux/actions";
import                       "font-awesome/less/font-awesome.less";
import                       "project/styles/play-game.less";

const MIN_PLAYER_COUNT = 3;

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
		}).then(
			() => {
				this.gameJoined = true;

				GameClient.updatePlayerPresence({ gameName: game.name });
			}
		);

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

	handleStartGameButtonClick = () => {
		GameClient.startGame({
			gameName: this.props.game.name
		});
	}

	renderBoard = () => {
		const myTurn = this.props.game.me && this.props.game.me.color === this.props.game.currentPlayerColor;
		const gameIsOver = !!this.props.game.winner;
		const gameIsStarted = this.props.game.isStarted && !gameIsOver;

		return (
			<div
				className={`c_game ${gameIsOver ? "game-over" : ""} ${gameIsStarted ? "game-started" : ""}`}
			>
				<PlayerIndicators
					players={this.props.game.players}
					currentPlayerColor={this.props.game.currentPlayerColor}
					playerLimit={this.props.game.playerLimit}
					markCurrent={gameIsStarted}
				/>
				<div
					className="c_game--board-container"
				>
					{
						!gameIsStarted ?
							(
								<div
									className="c_game--start-game-overlay"
								>
									<div
										className="c_game--start-game-overlay--dialog"
									>
										<button
											className="btn btn-default btn-lg fa fa-play"
											disabled={this.props.game.players.size < MIN_PLAYER_COUNT}
											onClick={this.handleStartGameButtonClick}
										>
											Start Game
										</button>
									</div>
								</div>
							) :
							null
					}
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
						allowPlacement={myTurn && gameIsStarted}
						gameIsOver={gameIsOver}
						onCellClick={this.handleCellClick}
					/>
				</div>
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
