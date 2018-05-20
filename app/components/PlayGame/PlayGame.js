import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import {
	injectIntl,
	intlShape,
}                         from "react-intl";
import classnames         from "classnames";
import Icon               from "material-ui/Icon";
import Badge              from "material-ui/Badge";
import { withStyles }     from "material-ui/styles";
import GameJoinDialog     from "@app/components/GameJoinDialog";
import Board              from "@app/containers/Board";
import PlayerIndicators   from "@app/components/PlayerIndicators";
import Config             from "@app/config";
import messages           from "./messages";
import StartGameOverlay   from "./StartGameOverlay";
import WinnerBanner       from "./WinnerBanner";


const styles = {
	root: {
		margin: "1em",
	},

	boardContainer: {
		position: "relative",
	},

	watcherIcon: {
		fontSize: "1.7em",
	},


	watcherBadge: {
		marginRight: "1em",
	},
};

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
	 * @prop {external:Immutable.Map} [game] - the game record representing the game
	 * @prop {external:Immutable.Map<external:Immutable.Map>} [playerUsers] - map of users
	 *	corresponding to the players in this game, keyed by user ID
	 * @prop {string} [currentUserPlayerColor] - if the player currently viewing the game is a player
	 *	in the game, this is the color corresponding to that player. Otherwise, undefined.
	 */
	static propTypes = {
		gameName: PropTypes.string.isRequired,
		game: ImmutablePropTypes.map,
		playerUsers: ImmutablePropTypes.mapOf(
			ImmutablePropTypes.map,
			PropTypes.string,
		),
		currentUserPlayerColor: PropTypes.string,
		classes: PropTypes.object,
		isInGame: PropTypes.bool,
		isWatchingGame: PropTypes.bool,
		hasJoinedGame: PropTypes.bool,
		watcherCount: PropTypes.number,
		onJoinGame: PropTypes.func.isRequired,
		onWatchGame: PropTypes.func.isRequired,
		onStartGame: PropTypes.func.isRequired,
		onGetGame: PropTypes.func.isRequired,
		onPlaceMarble: PropTypes.func.isRequired,
		onCancelJoin: PropTypes.func.isRequired,
		intl: intlShape.isRequired,
	}

	formatMessage = (...args) => {
		return this.props.intl.formatMessage(...args);
	}

	componentWillMount() {
		if (this.props.game) {
			this.joinIfInGame();
		}
		else {
			this.props.onGetGame();
		}
	}

	componentDidUpdate() {
		if (this.props.game) {
			if (this.props.playerUsers && this.props.playerUsers.size === this.props.game.get("players").size) {
				this.joinIfInGame();
			}
		}
	}

	/**
	 * Joins the game if the current user is already a player in the game.
	 *
	 * @function
	 * @return {void}
	 */
	joinIfInGame = () => {
		if (this.props.isInGame) {
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
		if (!this.props.game || this.props.hasJoinedGame) {
			return;
		}

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
			this.props.game.get("winner") || cell.get("color") ||
			!this.props.hasJoinedGame
		) {
			return;
		}

		this.props.onPlaceMarble({
			gameName: this.props.game.get("name"),
			position: cell.get("position"),
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
		this.props.onStartGame();
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
	 * Handles cancelling game joining.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handleJoinCancel = () => {
		this.props.onCancelJoin();
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
			isInGame,
			isWatchingGame,
			watcherCount,
			playerUsers
		} = this.props;

		const myTurn = this.props.currentUserPlayerColor === game.get("currentPlayerColor");
		const gameIsOver = !!game.get("winner");
		const gameIsStarted = game.get("isStarted") && !gameIsOver;

		const watcherSummary = watcherCount > 0 ?
			this.formatMessage(
				messages.watchers.summary[isWatchingGame ? "withYou" : "withoutYou"],
				{
					// If user is watching the game, they are included in the watcherCount.
					// The message says something to the effect of "You and X others", so we
					// need to decrement it if the current user is watching
					watcherCount: isWatchingGame ?
						watcherCount - 1 :
						watcherCount,
				}
			) :
			null;

		return (
			<div
				className={classnames(
					this.props.classes.root,
					{
						"game-over": gameIsOver,
						"game-started": gameIsStarted,
					}
				)}
			>
				{
					watcherSummary && (
						<div>
							<Badge
								badgeContent={watcherCount}
								color="primary"
								className={this.props.classes.watcherBadge}
							>
								<Icon
									className={classnames(
										"icon",
										this.props.classes.watcherIcon
									)}
								>watcher</Icon>
							</Badge> {watcherSummary}
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
					game={game}
					markActive={gameIsStarted}
					playerUsers={playerUsers}
				/>
				<div
					className={this.props.classes.boardContainer}
				>
					{
						!gameIsStarted && !gameIsOver && !isWatchingGame && (
							<StartGameOverlay
								canStart={game.get("players").size >= Config.game.players.min}
								onStartClick={this.handleStartGameButtonClick}
							/>
						)
					}
					{
						gameIsOver && (
							<WinnerBanner
								winnerColor={game.get("winner")}
							/>
						)
					}
					<Board
						gameName={this.props.game.get("name")}
						allowPlacement={myTurn && gameIsStarted}
						onCellClick={this.handleCellClick}
					/>
				</div>
			</div>
		);
	}

	/**
	 * Renders the component.
	 *
	 * @return {external:React.Component} the component as a React component tree
	 */
	render() {
		if (!this.props.game) {
			return null;
		}

		return this.renderBoard();
	}
}

export { PlayGame as Unwrapped };

export default injectIntl(withStyles(styles)(PlayGame));
