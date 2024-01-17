import React, { useEffect, useState, useRef, useCallback, CSSProperties } from "react";
import { List }            from "immutable";
import classnames         from "classnames";
import {Icon, Badge, Popover} from "@mui/material";

import GameJoinDialog     from "@app/components/GameJoinDialog";
import Board from "@app/components/Board"
import ZoomControls       from "@app/components/Board/ZoomControls";
import PlayerIndicators   from "@app/components/PlayerIndicators";
import PlayerInfoPopup from "@app/components/PlayerInfoPopup";
import Config             from "@app/config";
import ImmutableBoard from "@shared/board";
import {selectors} from "@lib/redux/selectors";

import StartGameOverlay   from "./StartGameOverlay";
import WinnerBanner       from "./WinnerBanner";
import AddPlayerButton    from "@app/components/AddPlayerButton";
import { Player, PlayerUser } from "@shared/quintro";
import { Game } from "@shared/game";
import { useGetGameQuery } from "@lib/services/games-service";


type OnJoinGameCallback = ({colors}: {colors: any[]}) => void;

interface PlayGameProps {
	gameName: string;
	playerUsers: PlayerUser[];
	currentUserPlayers: Set<Player>;
	currentZoomLevel?: number;
	isInGame: boolean;
	isWatchingGame: boolean;
	hasJoinedGame: boolean;
	watcherCount: number;
	classes?: {
		root: string;
		gameControls: string;
		playerControls: string;
		watcherBadge: string;
		watcherIcon: string;
		addPlayerButton: string;
		zoomControls: string;
		gameArea: string;
		boardContainer: string;
	};
	onJoinGame?: OnJoinGameCallback;
	onStartGame?: () => void;
	onZoomLevelChange?: (value: number) => void;
	onPlaceMarble?: (args: {
		gameName: string;
		position: string;
		color: string;
	}) => void;
	onWatchGame?: () => void;
	onCancelJoin?: () => void;
}


const styles = {
	root: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100%",
	},

	gameControls: {
		display: "flex",
		justifyContent: "space-between",
	},

	playerControls: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},

	addPlayerButton: {
		marginLeft: "2em",
	},

	zoomControls: {
		marginLeft: "auto",
	},

	gameArea: {
		flex: 1,
		overflow: "auto",
	},

	boardContainer: {
		position: "relative",
		display: "inline-block",
		alignSelf: "center",
	},

	watcherIcon: {
		fontSize: "1.7em",
	},

	watcherBadge: {
		marginRight: "1em",
	},
};


const getMePlayers = ({
	playerUsers,
	game,
}: {
	playerUsers: PlayerUser[];
	game: Game;
}) => {
	const meUserIDs = playerUsers.reduce(
		(ids, user: PlayerUser) => user.isMe ?
			ids.add(user.id) :
			ids,
		new Set()
	);
	
	return new Set(
		game.players.filter(
			(player: Player) => meUserIDs.has(player.userID)
		)
	);
};

/**
 * Joins the game using the specified color.
 *
 * This function is asynchronous; the user is not guaranteed to have joined the game
 * by the time it returns.
 */
const joinGame = ({
	colors,
	game,
	hasJoinedGame,
	isInGame,
	playerUsers,
	onJoinGame,
}: {
	colors?: string[];
	game: Game;
	hasJoinedGame: boolean;
	isInGame: boolean;
	playerUsers: PlayerUser[];
	onJoinGame?: OnJoinGameCallback;
}): void => {
	if (!game || hasJoinedGame) {
		return;
	}
	
	if (!colors && isInGame) {
		colors = [...getMePlayers({
			playerUsers,
			game,
		})].map((player: Player) => player.color);
	}

	if (onJoinGame) {
		onJoinGame({ colors });
	}
};


/**
 * Component for rendering the game UI.
 *
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
const PlayGame = ({
	gameName,
	currentUserPlayers,
	hasJoinedGame,
	isInGame,
	isWatchingGame,
	playerUsers,
	watcherCount,
	currentZoomLevel,
	onJoinGame,
	onStartGame,
	onZoomLevelChange,
	onPlaceMarble,
	onCancelJoin,
	onWatchGame,
	classes = {
		root: "",
		gameControls: "",
		gameArea: "",
		addPlayerButton: "",
		boardContainer: "",
		playerControls: "",
		watcherBadge: "",
		watcherIcon: "",
		zoomControls: "",
	},
}: PlayGameProps) => {
	const {
		data: game,
		isError,
		isLoading,
		isSuccess,
		error,
	} = useGetGameQuery(gameName);

	console.log("Game:", game);
	console.log("isError:", isError);
	console.log("isLoading:", isLoading);
	console.log("isSuccess:", isSuccess);
	console.log("error:", error);

	const [selectedPlayerColor, setSelectedPlayerColor] = useState<string|null>(null);
	const [selectedIndicatorEl, setSelectedIndicatorEl] = useState<Element|null>(null);

	const mounted = useRef();
	useEffect(() => {
		if (!mounted.current) {
			if (isInGame) {
				joinGame({
					game,
					hasJoinedGame,
					isInGame,
					onJoinGame,
					playerUsers,
				});
			}
		}
	}, [
		game,
		isInGame,
		hasJoinedGame,
		onJoinGame,
	]);

	useEffect(() => {
		if (
			game &&
			playerUsers &&
			playerUsers.length === new Set(game.players.map(
				(player) => player.userID)
			).size &&
			isInGame
		) {
			joinGame({
				game,
				playerUsers,
				hasJoinedGame,
				isInGame,
				onJoinGame,
			});
		}

	}, [game, playerUsers, isInGame, onJoinGame, hasJoinedGame]);

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
	const handleCellClick = useCallback(({ cell }) => {
		if (
			game.winner || cell.color ||
			!hasJoinedGame
		) {
			return;
		}

		// const currentPlayer = selectors.getCurrentPlayer({
		// 	games: [
		// 		game,
		// 	]
		// }, {name: game.name});
		//TODO: FIX
		const currentPlayer = game.players[0];

		if (!currentUserPlayers.has(currentPlayer)) {
			return;
		}

		onPlaceMarble({
			gameName: game.name,
			position: cell.position,
			color: currentPlayer.color,
		});
	}, [
		onPlaceMarble, 
	]);

	/**
	 * Handles clicking the "Start Game" button.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const handleStartGameButtonClick = useCallback(() => {
		onStartGame();
	}, [onStartGame]);

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
	const handleJoinSubmit = useCallback(({ color }) => {
		joinGame({
			game,
			hasJoinedGame,
			isInGame,
			onJoinGame,
			playerUsers,
			colors: [ color ],
		});
	}, [game, hasJoinedGame, isInGame, onJoinGame, playerUsers]);

	/**
	 * Handles cancelling game joining.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const handleJoinCancel = useCallback(() => {
		onCancelJoin();
	}, [onCancelJoin]);

	const handleZoomLevelChange = useCallback((value: number) => {
		onZoomLevelChange(value);
	}, [onZoomLevelChange]);

	/**
	 * Handles a click on a player indicator.
	 *
	 * @function
	 *
	 * @param {object} args
	 * @param {client.records.PlayerRecord} args.selectedPlayer - the player whose indicator was clicked
	 * @param {DOMElement} args.element - the DOM element corresponding to the indicator selected
	 *
	 * @return {void}
	 */
	const handlePlayerIndicatorClick = useCallback(({ selectedPlayer, element }) => {
		if (selectedPlayer === null) {
			return;
		}

		setSelectedIndicatorEl(element);
		setSelectedPlayerColor(selectedPlayer.get("color"));
	}, [setSelectedIndicatorEl, setSelectedPlayerColor]);

	const closePopover = useCallback(() => {
		setSelectedIndicatorEl(null);
		setSelectedPlayerColor(null);
	}, [setSelectedIndicatorEl, setSelectedPlayerColor])

	const handlePlayerInfoPopoverClose = useCallback(() => {
		closePopover();
	}, [closePopover]);

	const handleAddPlayer = useCallback(({ color }) => {
		onJoinGame({
			colors: [ color ],
		});
	}, [onJoinGame]);

	if (!game) {
		return null;
	}

	
	// const myPlayer = selectors.getCurrentPlayer({
	// 	games: {
	// 		items: [game],
	// 	}
	// }, {
	// 	name: game.name,
	// });
	const myPlayer = game.players[0];
	const myTurn = currentUserPlayers.has(myPlayer);
	const gameIsOver = !!game.winner;
	const gameIsStarted = game.isStarted && !gameIsOver;

	let watcherSummary: ReactNode|null = null;

	if (watcherCount > 0) {
		if (isWatchingGame) {
			watcherSummary = (
				<FormattedMessage
					id="quintro.components.PlayGame.watchers.summary.withYou"
					defaultMessage={`You {watcherCount, plural,
						=0 {}
						one {and 1 other person}
						other {and {watcherCount} other people}
					} are watching this game.`}
					values={{
						watcherCount: watcherCount - 1,
					}}
				/>
			);
		}
		else {
			watcherSummary = (
				<FormattedMessage
					id="quintro.components.PlayGame.watchers.summary.withoutYou"
					defaultMessage={`{watcherCount, plural,
						one {1 person is}
						other {{watcherCount} people are}
					} watching this game.`}
					values={{
						watcherCount,
					}}
				/>
			);
		}
	}
		
	const boardContainerStyles: CSSProperties = {
		fontSize: currentZoomLevel + "em",
	};

	if (myTurn) {
		boardContainerStyles.border = `7px solid ${myPlayer.color}`;
		boardContainerStyles.outline = "1px solid black";
	}

	return (
		<div
			className={classnames(
				classes.root,
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
							className={classes.watcherBadge}
						>
							<Icon
								className={classnames(
									"icon",
									classes.watcherIcon
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
						onSubmit={handleJoinSubmit}
						onCancel={handleJoinCancel}
						onWatchGame={onWatchGame}
					/>
				)
			}
			<div
				className={classes.gameControls}
			>
				<div
					className={classes.playerControls}
				>
					<PlayerIndicators
						game={game}
						markActive={gameIsStarted}
						playerUsers={playerUsers}
						onIndicatorClick={handlePlayerIndicatorClick}
					/>
					{
						game.players.length < game.playerLimit && (
							<AddPlayerButton
								className={classes.addPlayerButton}
								game={game}
								onAdd={handleAddPlayer}
							/>
						)
					}
				</div>
				<Popover
					key="player indicator popover"
					open={!!selectedIndicatorEl}
					onClose={handlePlayerInfoPopoverClose}
					anchorEl={selectedIndicatorEl}
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "center",
					}}
					transformOrigin={{
						vertical: "top",
						horizontal: "left",
					}}
				>
					{
						selectedIndicatorEl === null ?
							(
								//TODO: FIX onDisplayNameChange, playerUser
								<PlayerInfoPopup
									playerUser={playerUsers[0]}
									onDisplayNameChange={() => {}}
									player={
										game.players.find(
											(player) => player.color === selectedPlayerColor
										)
									}
								/>
							) :
							null
					}
				</Popover>
				<ZoomControls
					className={classes.zoomControls}
					onZoomLevelChange={handleZoomLevelChange}
					currentZoomLevel={currentZoomLevel}
					minZoomLevel={0.2}
					maxZoomLevel={3}
					stepSize={0.2}
				/>
			</div>
			<div
				className={classes.gameArea}
			>
				<div
					className={classes.boardContainer}
					style={boardContainerStyles}
				>
					{
						!gameIsStarted && !gameIsOver && !isWatchingGame && (
							<StartGameOverlay
								canStart={game.players.length >= Config.game.players.min}
								onStartClick={handleStartGameButtonClick}
							/>
						)
					}
					{
						gameIsOver && (
							<WinnerBanner
								winnerColor={game.winner}
							/>
						)
					}
					<Board
						board={board}
						quintros={List()}
						// gameName={game.get("name")}
						allowPlacement={myTurn && gameIsStarted}
						onCellClick={handleCellClick}
					/>
				</div>
			</div>
		</div>
	);
}

export default PlayGame;
