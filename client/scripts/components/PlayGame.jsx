import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { withRouter }     from "react-router";
import { connect }        from "react-redux";
import { goBack }         from "react-router-redux";
import GameJoinDialog     from "project/scripts/components/GameJoinDialog";
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
import Config             from "project/scripts/config";
import                         "font-awesome/less/font-awesome.less";
import                         "project/styles/play-game.less";

class PlayGame extends React.Component {
	static propTypes = {
		gameName: PropTypes.string,
		game: PropTypes.instanceOf(GameRecord),
		players: ImmutablePropTypes.listOf(
			PropTypes.instanceOf(PlayerRecord)
		),
		getGameError: PropTypes.object,
		enableBackgroundImage: PropTypes.bool,
		dispatch: PropTypes.func.isRequired
	}

	state = {
		gameJoined: false,
		isWatching: false
	}

	componentWillMount() {
		GameClient.watchGame({
			gameName: this.props.gameName
		});

		if (this.props.game) {
			this.joinIfInGame();
		}
		else {
			this.props.dispatch(getGame({ gameName: this.props.gameName }));
		}
	}

	componentDidUpdate() {		
		if (this.props.game) {
			if (!this.props.players || this.props.players.size !== this.props.game.players.size) {
				this.props.dispatch(getUsers({
					userIDs: this.props.game.players.map(
						(player) => player.userID
					).toArray()
				}));
			}
			else {
				this.joinIfInGame();
			}
		}
	}

	getMePlayer = () => {
		return this.props.players && this.props.players.find((player) => player.user.isMe);
	}

	joinIfInGame = () => {
		const mePlayer = this.getMePlayer();

		if (mePlayer) {
			this.joinGame();
		}
	}

	joinGame = ({ color } = {}) => {
		if (!this.props.game || this.state.gameJoined) {
			return;
		}

		GameClient.joinGame({
			gameName: this.props.game.name,
			color
		}).then(
			() => {
				this.setState({gameJoined: true});

				GameClient.updatePlayerPresence({ gameName: this.props.game.name });
			}
		).catch(
			(err) => {
				// eslint-disable-next-line no-console
				console.error(err);
			}
		);

	}

	handleCellClick = ({ position, cell }) => {
		if (
			this.props.game.winner || (cell && cell.color) ||
			!this.state.gameJoined
		) {
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

	handleJoinSubmit = ({ color }) => {
		this.joinGame({ color });
	}

	handleJoinCancel = () => {
		this.props.dispatch(goBack());
	}

	handleWatchGame = () => {
		this.setState({ isWatching: true });
	}

	renderBoard = () => {
		const mePlayer = this.getMePlayer();
		const myTurn = mePlayer && mePlayer.color === this.props.game.currentPlayerColor;
		const gameIsOver = !!this.props.game.winner;
		const gameIsStarted = this.props.game.isStarted && !gameIsOver;

		const classes = [
			"c_game"
		];

		if (gameIsOver) {
			classes.push("game-over");
		}

		if (gameIsStarted) {
			classes.push("game-started");
		}

		return (
			<div
				className={classes.join(" ")}
			>
				{
					this.state.isWatching && (
						<div
							className="c_game--watching-game-notification alert alert-info"
							role="alert"
						>
						You are watching this game.
						</div>
					)
				}
				{
					!(mePlayer || this.state.gameJoined || this.state.isWatching || gameIsOver) && (
						<GameJoinDialog
							game={this.props.game}
							onSubmit={this.handleJoinSubmit}
							onCancel={this.handleJoinCancel}
							onWatchGame={this.handleWatchGame}
							enableBackgroundImage={this.props.enableBackgroundImage}
						/>
					)
				}
				{
					this.props.players && this.props.players.size === this.props.game.players.size &&
						(
							<PlayerIndicators
								players={this.props.players}
								currentPlayerColor={this.props.game.currentPlayerColor}
								playerLimit={this.props.game.playerLimit}
								markCurrent={gameIsStarted}
								onDisplayNameChange={this.handleDisplayNameChange}
								enableBackgroundImage={this.props.enableBackgroundImage}
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
											disabled={this.props.game.players.size < Config.game.players.min}
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
								>{Config.game.colors.get(this.props.game.winner).name} wins!</div>
							</div>
						)
					}
					<Board
						board={this.props.game.board}
						allowPlacement={myTurn && gameIsStarted}
						gameIsOver={gameIsOver}
						onCellClick={this.handleCellClick}
						enableBackgroundImage={this.props.enableBackgroundImage}
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
			const settings = state.get("settings");

			const game = games && games.items.get(ownProps.gameName);

			const props = {
				players: playerSelector(state, {
					...ownProps,
					players: game && game.players
				}),
				enableBackgroundImage: settings.enableBackgroundImage
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
