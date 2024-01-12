import React, { useCallback, useEffect, useState }         from "react";
import PropTypes     from "prop-types";
import {Map} from "immutable";
// import ImmutablePropTypes from "react-immutable-proptypes";
// import { Link }      from "react-router-dom";
import Dialog        from "@mui/material/Dialog";
import Card          from "@mui/material/Card";
import CardHeader    from "@mui/material/CardHeader";
import CardContent   from "@mui/material/CardContent";
import Button        from "@mui/material/Button";
// import {`
// 	injectIntl,
// 	intlShape,
// 	FormattedMessage,
// }                    from "reac`t-intl";

// import gameSelectors from "@app/selectors/games/game";
import ColorPicker   from "@app/components/ColorPicker";
import { useJoinGameMutation } from "@lib/services/game-socket";

import messages      from "./messages";
import Link from "next/link";
import {Game} from "@shared/game";


//TODO: FIX
const gameSelectors = {
	canAddPlayerColor(game: any, {color}: {color: string}) {
		return true;
	}
};

//TODO: FIX
const formatMessage = ({id}: {id: string;}, values?: {[key: string]: any}) => {
	return id;
};

const CannotJoinGame = ({
	reason,
	handleWatchGameButtonClicked,
}: {
	reason: string;
	handleWatchGameButtonClicked: () => void;
}) => {
	return (
		<div>
			{reason}.
			<div>
				{
					formatMessage(messages.cannotJoinActions, {
						findGameLink: (
							<Link href="/game/find">
								{formatMessage(messages.findGameLinkText)}
							</Link>
							// <Link
							// 	to="/game/find"
							// >
							// 	<FormattedMessage
							// 		{...messages.findGameLinkText}
							// 	/>
							// </Link>
						),

						createGameLink: (
							<Link href="/game/create">
								{formatMessage(messages.createGameLinkText)}
							</Link>
							// <Link
							// 	to="/game/create"
							// >
							// 	<FormattedMessage
							// 		{...messages.createGameLinkText}
							// 	/>
							// </Link>
						),
					})
				}
			</div>
			<Button
				className="watch-game-button"
				color="secondary"
				onClick={handleWatchGameButtonClicked}
			>
				{
					formatMessage(messages.buttons.watchGame.label)
				}
				{/* <FormattedMessage
					{...messages.buttons.watchGame.label}
				/> */}
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
				reason={formatMessage(messages.cannotJoinReasons.gameIsFull)}
				handleWatchGameButtonClicked={handleWatchGameButtonClicked}
			/>
		);
	}
	else if (game.isStarted) {
		body = (
			<CannotJoinGame
				reason={formatMessage(messages.cannotJoinReasons.gameIsInProgress)}
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
							{formatMessage(messages.color)}
							{/* <FormattedMessage
								{...messages.color}
							/>: */}
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
							{formatMessage(messages.buttons.join.label)}
							{/* <FormattedMessage
								{...messages.buttons.join.label}
							/> */}
						</Button>
						<Button
							className="cancel-button"
							type="button"
							onClick={handleCancelButtonClicked}
						>
							{formatMessage(messages.buttons.cancel.label)}
							{/* <FormattedMessage
								{...messages.buttons.cancel.label}
							/> */}
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
						title={formatMessage(messages.joinThisGamePrompt)}
					/>
				) }
				<CardContent>
					{ body }
				</CardContent>
			</Card>
		</Dialog>
	);
}

export { GameJoinDialog as Unwrapped };

export default GameJoinDialog;

// export default injectIntl(GameJoinDialog);
