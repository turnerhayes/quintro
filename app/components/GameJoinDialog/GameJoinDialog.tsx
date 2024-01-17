import React, { ReactNode, useCallback, useEffect, useState } from "react";
import {
	Dialog,
	Card,
	CardHeader,
	CardContent,
	Button,
	Link as MUILink
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import NextLink from "next/link";
import ColorPicker from "@app/components/ColorPicker";
import { useJoinGameMutation } from "@lib/services/game-socket";

import {Game} from "@shared/game";

const Link = ({
	href,
	children,
}: {
	href: string;
	children: ReactNode;
}) => (
	<MUILink
		component={NextLink}
		href={href}
	>
		{children}
	</MUILink>);

//TODO: FIX
const gameSelectors = {
	canAddPlayerColor(game: any, {color}: {color: string}) {
		return true;
	}
};


const CannotJoinGame = ({
	reason,
	handleWatchGameButtonClicked,
}: {
	reason: ReactNode;
	handleWatchGameButtonClicked: () => void;
}) => {
	return (
		<div>
			{reason}.
			<div>
				<FormattedMessage
					id="quintro.components.GameJoinDialog.cannotJoinActions"
					description="Message giving links to find or create a game in the case that the user cannot join a game"
					defaultMessage="{findGameLink} or {createGameLink}"
					values={{
						findGameLink: (
							<Link
								href="/game/find"
							>
								<FormattedMessage
									id="quintro.components.GameJoinDialog.findGameLinkText"
									description="Text for link to find game page when the user can't join a game. Used in message quintro.components.GameJoinDialog.cannotJoinActions."
									defaultMessage="Find another game"
								/>
							</Link>
						),
						createGameLink: (
							<Link
								href="/game/create"
							>
								<FormattedMessage
									id="quintro.components.GameJoinDialog.createGameLinkText"
									description="Text for link to create game page when the user can't join a game. Used in message quintro.components.GameJoinDialog.cannotJoinActions."
									defaultMessage="create your own!"
								/>
							</Link>
						),
					}}
				/>
			</div>
			<Button
				className="watch-game-button"
				color="secondary"
				onClick={handleWatchGameButtonClicked}
			>
				<FormattedMessage
					id="quintro.components.GameJoinDialog.buttons.watchGame.label"
					description="Label for the button for the user to watch a game"
					defaultMessage="I want to watch this game"
				/>
			</Button>
		</div>
	);
};

/**
 * @callback client.react-components.GameJoinDialog~onSubmitCallback
 *
 * @param {string} color - the color ID of the color to use for the current player on joining
 *
 * @return {void}
 */

/**
 * @callback client.react-components.GameJoinDialog~onCancelCallback
 *
 * @return {void}
 */

/**
 * @callback client.react-components.GameJoinDialog~onWatchGameCallback
 *
 * @return {void}
 */

interface GameJoinDialogProps {
	game: Game;
	onSubmit: ({color}: {color: string; }) => void;
	onCancel: () => void;
	onWatchGame?: () => void;
}

/**
 * Component representing a dialog used to join a game.
 *
 * @class
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
const GameJoinDialog = ({
	game,
	onSubmit,
	onCancel,
	onWatchGame,
}: GameJoinDialogProps) => {
	const [selectedColor, setSelectedColor] = useState<string|null>(null);

	const [joinGame, {isLoading: isJoiningGame}] = useJoinGameMutation();

	useEffect(() => {
		if (!gameSelectors.canAddPlayerColor(game, { color: selectedColor })) {
			setSelectedColor(ColorPicker.getDefaultColorForGame({ game }));
		}
	}, [setSelectedColor, selectedColor]);

	/**
	 * Handles the cancel button being clicked.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const handleCancelButtonClicked = useCallback(() => {
		onCancel();
	}, [onCancel]);

	/**
	 * Handles the watch game button being clicked.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const handleWatchGameButtonClicked = useCallback(() => {
		if (onWatchGame) {
			onWatchGame();
		}
	}, [onWatchGame]);

	/**
	 * Handles the submit button being clicked.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const handleSubmit = useCallback((event) => {
		event.preventDefault();

		joinGame({
			gameName: game.name,
			colors: [selectedColor],
		});
		onSubmit({
			color: selectedColor,
		});
	}, [onSubmit, selectedColor, joinGame, game]);

	const handleColorChosen = useCallback(({ color }) => {
		setSelectedColor(color);
	}, [setSelectedColor]);

	/**
	 * Renders the content of the dialog for the case when the user is not allowed to join the game.
	 *
	 * @function
	 *
	 * @param {object} args - the function arguments
	 * @param {string} reason - a string containing a message explaining why the user could not join
	 *	the game
	 *
	 * @return {external:React.Component} the dialog content to render
	 */
	
	const isFull = game.players.length === game.playerLimit;

	let body: React.ReactElement;
	let canJoin = false;

	if (isFull) {
		body = (
			<CannotJoinGame
				reason={
					<FormattedMessage
						id="quintro.components.GameJoinDialog.cannotJoinReasons.gameIsFull"
						description="Message shown when a user cannot join a game because it is full."
						defaultMessage="Sorry, this game is full"
					/>
				}
				handleWatchGameButtonClicked={handleWatchGameButtonClicked}
			/>
		);
	}
	else if (game.isStarted) {
		body = (
			<CannotJoinGame
				reason={
					<FormattedMessage
						id="quintro.components.GameJoinDialog.cannotJoinReasons.gameIsInProgress"
						description="Message shown when a user cannot join a game because it is already in progress."
						defaultMessage="Sorry, this game is already in progress"
					/>
				}
				handleWatchGameButtonClicked={handleWatchGameButtonClicked}
			/>
		);
	}
	else {
		body = (
				<form
					onSubmit={handleSubmit}
				>
					<div>
						<label
						>
							<FormattedMessage
								id="quintro.components.GameJoinDialog.color"
								description="Label for the color picker in the game joining dialog"
								defaultMessage="Color"
							/>:
							<ColorPicker
								game={game}
								selectedColor={selectedColor}
								onColorChosen={handleColorChosen}
							/>
						</label>
					</div>
					<div
					>
						<Button
							className="submit-button"
							type="submit"
							color="primary"
						>
							<FormattedMessage
								id="quintro.components.GameJoinDialog.buttons.join.label"
								description="Button text to join the game."
								defaultMessage="Join"
							/>
						</Button>
						<Button
							className="cancel-button"
							type="button"
							onClick={handleCancelButtonClicked}
						>
							<FormattedMessage
								id="quintro.components.GameJoinDialog.buttons.cancel.label"
								description="Button text to cancel joining the game."
								defaultMessage="Cancel"
							/>
						</Button>
					</div>
				</form>
		);
		canJoin = true;
	}

	return (
		<Dialog
			open
		>
			<Card>
				{ canJoin && (
					<CardHeader
						title={<FormattedMessage
							id="quintro.components.GameJoinDialog.joinThisGamePrompt"
							description="Header for the dialog to join a game."
							defaultMessage="Join this game"
						/>}
					/>
				) }
				<CardContent>
					{ body }
				</CardContent>
			</Card>
		</Dialog>
	);
}

export default GameJoinDialog;

