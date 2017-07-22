import {
	capitalize
}                         from "lodash";
import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { withRouter }     from "react-router";
import { connect }        from "react-redux";
import Board              from "project/scripts/components/Board";
import PlayerIndicators   from "project/scripts/components/PlayerIndicators";
import GameRecord         from "project/scripts/records/game";
import PlayerRecord       from "project/scripts/records/player";
import GameClient         from "project/scripts/utils/game-client";
import {
	getGame,
	getUsers,
	placeMarble,
	changeUserProfile
}                         from "project/scripts/redux/actions";
import {
	playerSelector
}                         from "project/scripts/redux/selectors";
import                         "font-awesome/less/font-awesome.less";
import                         "project/styles/play-game.less";

const MIN_PLAYER_COUNT = 3;

class PlayGame extends React.Component {
	static propTypes = {
		gameName: PropTypes.string,
		game: PropTypes.instanceOf(GameRecord),
		players: ImmutablePropTypes.listOf(
			PropTypes.instanceOf(PlayerRecord)
		),
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
		if (nextProps.game) {
			if(!this.gameJoined) {
				this.joinGame(nextProps.game);
			}

			if (!nextProps.players || nextProps.players.size !== nextProps.game.players.size) {
				this.props.dispatch(getUsers({
					userIDs: nextProps.game.players.map(
						(player) => player.userID
					).toArray()
				}));
			}
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
		).catch(
			(err) => {
				// eslint-disable-next-line no-console
				console.error(err);
			}
		);

	}

	handleCellClick = ({ position, cell }) => {
		if (this.props.game.winner || (cell && cell.color)) {
			return;
		}

		this.props.dispatch(
			placeMarble({
				gameName: this.props.game.name,
				position
			})
		);
	}

	handleStartGameButtonClick = () => {
		GameClient.startGame({
			gameName: this.props.game.name
		});
	}

	handleDisplayNameChange = ({ player, displayName }) => {
		this.props.dispatch(
			changeUserProfile({
				userID: player.userID,
				updates: {
					name: {
						display: displayName
					}
				}
			})
		);
	}

	renderBoard = () => {
		const mePlayer = this.props.players.find((player) => player.user.isMe);
		const myTurn = mePlayer && mePlayer.color === this.props.game.currentPlayerColor;
		const gameIsOver = !!this.props.game.winner;
		const gameIsStarted = this.props.game.isStarted && !gameIsOver;

		return (
			<div
				className={`c_game ${gameIsOver ? "game-over" : ""} ${gameIsStarted ? "game-started" : ""}`}
			>
				{
					this.props.players && this.props.players.size === this.props.game.players.size &&
						(
							<PlayerIndicators
								players={this.props.players}
								currentPlayerColor={this.props.game.currentPlayerColor}
								playerLimit={this.props.game.playerLimit}
								markCurrent={gameIsStarted}
								onDisplayNameChange={this.handleDisplayNameChange}
							/>
						)
				}
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
			const games = state.get("games");

			const game = games && games.items.get(ownProps.gameName);

			const props = {
				players: playerSelector(state, {
					...ownProps,
					players: game && game.players
				})
			};

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
