import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import createDebugger     from "debug";
import Button             from "material-ui/Button";
import PlayArrowIcon      from "material-ui-icons/PlayArrow";
import createHelper       from "@app/components/class-helper";
import GameJoinDialog     from "@app/components/GameJoinDialog";
import Board              from "@app/components/Board";
import PlayerIndicators   from "@app/components/PlayerIndicators";
// import GameClient         from "@app/utils/game-client";
import Config             from "@app/config";
import                         "./PlayGame.less";

const classes = createHelper("play-game");

const debug = createDebugger("quintro:client:play-game");

/**
 * Component for rendering the game UI.
 *
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
class PlayGame extends React.PureComponent {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {!string} gameName - the identifier of the game
	 * @prop {client.records.GameRecord} [game] - the game record representing the game
	 * @prop {external:Immutable.List<client.records.PlayerRecord>} [players] - list of the players in this game
	 * @prop {object} [getGameError] - an error object desribing why the game could not be retrieved from the
	 *	server, if applicable
	 */
	static propTypes = {
		gameName: PropTypes.string.isRequired,
		game: ImmutablePropTypes.map,
		players: ImmutablePropTypes.listOf(
			ImmutablePropTypes.map
		),
		getGameError: PropTypes.object,
		isInGame: PropTypes.bool,
		isWatchingGame: PropTypes.bool,
		onJoinGame: PropTypes.func.isRequired,
		onWatchGame: PropTypes.func.isRequired,
		onStartGame: PropTypes.func.isRequired,
		onGetGame: PropTypes.func.isRequired,
		onGetUsers: PropTypes.func.isRequired,
		onPlaceMarble: PropTypes.func.isRequired,
		onChangeUserProfile: PropTypes.func.isRequired,
		onCancelJoin: PropTypes.func.isRequired,
	}

	componentWillMount() {
		if (this.props.game) {
			this.joinIfInGame();
		}
		else {
			this.props.onGetGame({ gameName: this.props.gameName });
		}
	}

	componentDidUpdate() {		
		if (this.props.game) {
			if (!this.props.players || this.props.players.size !== this.props.game.get("players").size) {
				this.props.onGetUsers({
					userIDs: this.props.game.get("players").map(
						(player) => player.get("userID")
					).toArray()
				});
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
	 * @return {?external:Immutable.Map} map representing the current user, or
	 *	undefined if such a player does not exist (or the `players` prop has not yet been populated)
	 */
	getMePlayer = () => {
		return this.props.players && this.props.players.find((player) => player.getIn(["isMe"]));
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
		if (!this.props.game || this.props.isInGame) {
			return;
		}

		debug("Joining game with color", color);

		this.props.onJoinGame({ color });

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
			this.props.game.get("winner") || cell.color ||
			!this.state.gameJoined
		) {
			return;
		}

		this.props.onPlaceMarble({
			gameName: this.props.game.get("name"),
			position: cell.position,
		});
	}

	/**
	 * Handles clicking the "Start Game" button.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handleStartGameButtonClick = () => {
		debug("Start game");
		this.props.onStartGame();
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
		this.props.onChangeUserProfile({
			userID: player.userID,
			updates: {
				name: {
					display: displayName
				}
			}
		});
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
		this.props.onCancelJoin();
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
			isInGame,
			isWatchingGame,
		} = this.props;

		const mePlayer = this.getMePlayer();
		const myTurn = mePlayer && mePlayer.get("color") === game.get("currentPlayerColor");
		const gameIsOver = !!game.get("winner");
		const gameIsStarted = game.get("isStarted") && !gameIsOver;

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
					isWatchingGame && (
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
					!(isInGame || isWatchingGame || gameIsOver) && (
						<GameJoinDialog
							game={game}
							onSubmit={this.handleJoinSubmit}
							onCancel={this.handleJoinCancel}
							onWatchGame={this.props.onWatchGame}
						/>
					)
				}
				<PlayerIndicators
					players={players}
					currentPlayerColor={game.get("currentPlayerColor")}
					playerLimit={game.get("playerLimit")}
					markCurrent={gameIsStarted}
					onDisplayNameChange={this.handleDisplayNameChange}
				/>
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
											disabled={game.get("players").size < Config.game.players.min}
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
								>{Config.game.colors.get(game.get("winner")).name} wins!</div>
							</div>
						)
					}
					<Board
						board={game.get("board")}
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

export default PlayGame;
