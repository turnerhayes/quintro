import React, { useCallback }              from "react";
// import { withStyles }     from "@mui/material/styles";
import classnames         from "classnames";

import Marble             from "@app/components/Marble";
// import gameSelectors      from "@app/selectors/games/game";

import messages           from "./messages";
import { List } from "immutable";
import { Player, PlayerUser } from "@shared/quintro";
import {Game} from "@shared/game";

const gameSelectors = {
	getCurrentPlayerColor(game) {
		return null;
	}
}

const MARBLE_SIZE = {
	absent: "2.4em",
	normal: "3em",
};

const styles = {
	root: {
		marginBottom: "1em",
	},

	list: {
		listStyleType: "none",
		paddingLeft: 0,
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
	},

	item: {
		margin: "0 0.6em",
	},

	currentPlayerItem: {
		fontSize: "1.3em",
	},

	
	activeItem: {
		"&::after": {
			content: "'▲'",
			display: "inline-block",
			width: "100%",
			textAlign: "center",
			fontSize: "1.5em",
		},
	},
};

//TODO: FIX
const formatMessage = ({id}: {id: string;}, values?: {[key: string]: unknown}) => {
	return id;
};

/**
 * @callback client.react-components.PlayerIndicators~onIndicatorClick
 *
 * @param {object} args - the function arguments
 * @param {external:Immutable.Map} args.selectedPlayer - the player whose indicator was clicked
 *
 * @return {void}
 */

interface PlayerIndicatorsProps {
	game: Game;
	playerUsers: PlayerUser[];
	markActive: boolean;
	onIndicatorClick?: (args: {
		selectedPlayer: Player;
		index: number;
		element: Element;
	}) => void;
	indicatorProps?: {[key: string]: unknown}|(
		(args: {
			player: Player;
			user: PlayerUser;
			index: number;
			active: boolean;
			isPresent: boolean;
		}) => {}
	);
	classes?: {
		root: string;
		list: string;
		item: string;
		currentPlayerItem: string;
		activeItem: string;
	}
}

/**
 * Component representing a set of indicators for visualizing the state of the
 * players in the game.
 *
 * @class
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
const PlayerIndicators = ({
	game,
	playerUsers,
	markActive,
	onIndicatorClick,
	indicatorProps,
	classes = {
		root: "",
		list: "",
		item: "",
		currentPlayerItem: "",
		activeItem: "",
	},
}: PlayerIndicatorsProps) => {
	/**
	 * Handles a click on a player indicator.
	 *
	 * @function
	 *
	 * @param {client.records.PlayerRecord} selectedPlayer - the player whose indicator was clicked
	 * @param {DOMElement} element - the DOM element corresponding to the indicator selected
	 *
	 * @return {void}
	 */
	const handlePlayerIndicatorClick = useCallback(({ player, index, element }) => {
		if(onIndicatorClick) {
			onIndicatorClick({ selectedPlayer: player, index, element });
		}
	}, [onIndicatorClick]);

	return (
		<div
			className={classes.root}
		>
			<ul
				className={classes.list}
			>
				{
					game.players.map(
						(player, index) => {
							const playerUser = playerUsers[player.userID];

							const active = player.color === gameSelectors.getCurrentPlayerColor(game);
							const isPresent = !!game.playerPresence[player.color];

							let message;
							const messageArgs: {
								playerName?: string;
								playerColor?: string;
							} = {};

							if (playerUser.isMe) {
								message = messages.indicatorMessages.you;
							}
							else {
								if (playerUser.name.display) {
									message = messages.indicatorMessages.namedPlayer;
									messageArgs.playerName = playerUser.name.display;
								}
								else {
									message = messages.indicatorMessages.anonymousPlayer;
									messageArgs.playerColor = player.color;
								}

								if (isPresent) {
									message = message.present;
								}
								else {
									message = message.absent;
								}
							}

							const label = formatMessage(message, messageArgs);

							return (
								<li
									key={player.color}
									className={classnames([
										classes.item,
										{
											[classes.currentPlayerItem]: playerUser.isMe,
											[classes.activeItem]: active && markActive,
											[classes[`activeItem-color-${player.color}`]]: active && markActive,
										}
									])}
									title={label}
									onClick={(event) => handlePlayerIndicatorClick({ player, index, element: event.target })}
									{
										...(
											typeof indicatorProps === "function" ?
												indicatorProps({
													player,
													user: playerUser,
													index,
													active,
													isPresent,
												}) :
												indicatorProps
										)
									}
								>
									<Marble
										color={player.color}
										size={
											!isPresent ?
												MARBLE_SIZE.absent :
												MARBLE_SIZE.normal
										}
									/>
								</li>
							);
						}
					)
				}
				{
					[
						...Array(
							Math.max(
								game.playerLimit - game.players.length,
								0
							)
						)
					].map(
						(val, index) => {
							index = index + game.players.length;

							return (
								<li
									key={`not-filled-player-${index}`}
									className={classes.item}
									title={formatMessage(messages.indicatorMessages.availableSlot)}
									onClick={(event) => handlePlayerIndicatorClick({
										player: null,
										index,
										element: event.target,
									})}
									{
										...(
											typeof indicatorProps === "function" ?
												indicatorProps({
													player: null,
													user: null,
													index,
													active: false,
													isPresent: false,
												}) :
												indicatorProps
										)
									}
								>
									<Marble
										size={MARBLE_SIZE.normal}
										color={null}
									/>
								</li>
							);
						}
					)
				}
			</ul>
		</div>
	);
}

export { PlayerIndicators as Unwrapped };

export default PlayerIndicators;

// export default injectIntl(withStyles(styles)(PlayerIndicators));
