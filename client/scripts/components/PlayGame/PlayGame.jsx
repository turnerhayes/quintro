import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { withRouter }     from "react-router";
import { connect }        from "react-redux";
import { goBack }         from "react-router-redux";
import Button             from "material-ui/Button";
import PlayArrowIcon      from "material-ui-icons/PlayArrow";
import createHelper       from "project/scripts/components/class-helper";
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
import                         "./PlayGame.less";

const classes = createHelper("play-game");

/**
 * Component for rendering the game UI.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class PlayGame extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {!string} gameName - the identifier of the game
	 * @prop {function} dispatch - function to dispatch actions to the Redux store
	 * @prop {client.records.GameRecord} [game] - the game record representing the game
	 * @prop {external:Immutable.List<client.records.PlayerRecord>} [players] - list of the players in this game
	 * @prop {object} [getGameError] - an error object desribing why the game could not be retrieved from the
	 *	server, if applicable
	 */
	static propTypes = {
		gameName: PropTypes.string.isRequired,
		game: PropTypes.instanceOf(GameRecord),
		players: ImmutablePropTypes.listOf(
			PropTypes.instanceOf(PlayerRecord)
		),
		getGameError: PropTypes.object,
		dispatch: PropTypes.func.isRequired
	}

	/**
	 * Component state
	 *
	 * @type object
	 *
	 * @prop {boolean} gameJoined=false - whether or not the current user has joined the game and established the
	 *	necessary socket connections
	 * @prop {boolean} isWatching=false - whether or not the current user is watching the game (as opposed to playing)
	 */
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

	/**
	 * Returns the player from the `players` prop that represents the current user, if it exists.
	 *
	 * @function
	 * @return {?client.records.PlayerRecord} the player record representing the current user, or
	 *	undefined if such a player does not exist (or the `players` prop has not yet been populated)
	 */
	getMePlayer = () => {
		return this.props.players && this.props.players.find((player) => player.user.isMe);
	}

	/**
	 * Joins the game if the current user is already a player in the game.
	 *
	 * @function
	 * @return {void}
	 */
	joinIfInGame = () => {
		const mePlayer = this.getMePlayer();

		if (mePlayer) {
			this.joinGame();
		}
	}

	/**
	 * Joins the game using the specified color.
	 *
	 * This function is asynchronous; the user is not guaranteed to have joined the game
	 * by the time it returns.
	 *
	 * @function
	 *
	 * @param {object} [args] - the function arguments
	 * @param {string} [args.color] - the ID of the color to use for the current player.
	 *	If not specified, the server will assign a color on joining.
	 *
	 * @return {void}
	 */
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

	/**
	 * Handles the clicking of a cell.
	 *
	 * @function
	 *
	 * @param {object} args - the function arguments
	 * @param {Types.Cell} args.cell - the cell clicked
	 *
	 * @return {void}
	 */
	handleCellClick = ({ cell }) => {
		if (
			this.props.game.winner || cell.color ||
			!this.state.gameJoined
		) {
			return;
		}

		this.props.dispatch(
			placeMarble({
				gameName: this.props.game.name,
				position: cell.position
			})
		);
	}

	/**
	 * Handles clicking the "Start Game" button.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handleStartGameButtonClick = () => {
		GameClient.startGame({
			gameName: this.props.game.name
		});
	}

	/**
	 * Handles the change of the display name field for an anonymous player.
	 *
	 * @function
	 *
	 * @param {object} args - the function arguments
	 * @param {client.records.PlayerRecord} args.player - the player being changed
	 * @param {string} args.displayName - the name to set the player's display name to
	 *
	 * @return {void}
	 */
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

	/**
	 * Handles the user interaction to join the game.
	 *
	 * @function
	 *
	 * @param {object} args - the function arguments
	 * @param {string} args.color - the color ID of the color to use for the player
	 *
	 * @return {void}
	 */
	handleJoinSubmit = ({ color }) => {
		this.joinGame({ color });
	}

	/**
	 * Handles cancelling game joinining.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handleJoinCancel = () => {
		this.props.dispatch(goBack());
	}

	/**
	 * Handles the user interaction to start watching the game.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handleWatchGame = () => {
		this.setState({ isWatching: true });
	}

	/**
	 * Returns a React component that contains the game board.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the React component to render
	 */
	renderBoard = () => {
		const {
			game,
			players,
		} = this.props;

		const {
			gameJoined,
			isWatching,
		} = this.state;

		const mePlayer = this.getMePlayer();
		const myTurn = mePlayer && mePlayer.color === game.currentPlayerColor;
		const gameIsOver = !!game.winner;
		const gameIsStarted = game.isStarted && !gameIsOver;

		return (
			<div
				{...classes({
					extra: [
						gameIsOver && "game-over",
						gameIsStarted && "game-started",
					],
				})}
			>
				{
					this.state.isWatching && (
						<div
							{...classes({
								element: "watching-game-notification",
							})}
						>
						You are watching this game.
						</div>
					)
				}
				{
					!(mePlayer || gameJoined || isWatching || gameIsOver) && (
						<GameJoinDialog
							game={game}
							onSubmit={this.handleJoinSubmit}
							onCancel={this.handleJoinCancel}
							onWatchGame={this.handleWatchGame}
						/>
					)
				}
				{
					players && players.size === game.players.size &&
						(
							<PlayerIndicators
								players={players}
								currentPlayerColor={game.currentPlayerColor}
								playerLimit={game.playerLimit}
								markCurrent={gameIsStarted}
								onDisplayNameChange={this.handleDisplayNameChange}
							/>
						)
				}
				<div
					{...classes({
						element: "board-container",
					})}
				>
					{
						!gameIsStarted && !gameIsOver ?
							(
								<div
									{...classes({
										element: "start-game-overlay",
									})}
								>
									<div
										{...classes({
											element: "start-game-overlay-dialog",
										})}
									>
										<Button
											disabled={game.players.size < Config.game.players.min}
											onClick={this.handleStartGameButtonClick}
										>
											<PlayArrowIcon
											/>
											Start Game
										</Button>
									</div>
								</div>
							) :
							null
					}
					{
						gameIsOver && (
							<div
								{...classes({
									element: "winner-banner",
								})}
							>
								<div
									{...classes({
										element: "winner-banner-win-message",
									})}
								>{Config.game.colors.get(game.winner).name} wins!</div>
							</div>
						)
					}
					<Board
						board={game.board}
						allowPlacement={myTurn && gameIsStarted}
						gameIsOver={gameIsOver}
						onCellClick={this.handleCellClick}
					/>
				</div>
			</div>
		);
	}

	/**
	 * Renders the component.
	 *
	 * @return {!external:React.Component} the component as a React component tree
	 */
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
