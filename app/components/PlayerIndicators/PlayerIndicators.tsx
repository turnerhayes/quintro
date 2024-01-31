import React, { useCallback }              from "react";
import classnames         from "classnames";

import Marble             from "@app/components/Marble";
// import gameSelectors      from "@app/selectors/games/game";

import { Player, PlayerUser } from "@shared/quintro.d";
import {Game} from "@shared/game";
import { useIntl } from "react-intl";

// TODO: FIX
const gameSelectors = {
	getCurrentPlayerColor(game: Game) {
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

interface PlayerIndicatorsProps {
	game: Game;
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
 * @memberof client.react-components
 */
const PlayerIndicators = ({
	game,
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
	const intl = useIntl();
	console.log("Game:", game);

	/**
	 * Handles a click on a player indicator.
	 *
	 * @param selectedPlayer - the player whose indicator was clicked
	 * @param element - the DOM element corresponding to the indicator selected
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
							const active = player.color === gameSelectors.getCurrentPlayerColor(game);
							const isPresent = !!game.playerPresence[player.color];

							let label: string;

							if (player.user.isMe) {
								label = intl.formatMessage({
									id: "quintro.components.PlayerIndicators.indicatorMessages.you",
									description: "Label for a player indicator that represents the user",
									defaultMessage: "This is you",
								});
							}
							else {
								if (player.user.names?.display) {
									const playerName = player.user.names.display;
									if (isPresent) {
										label = playerName;
									}
									else {
										label = intl.formatMessage({
											id: "quintro.components.PlayerIndicators.indicatorMessages.namedPlayer.absent",
											description: "Label for a player indicator for a player that is not present in the game",
											defaultMessage: "{playerName} is absent",
										}, {
											playerName,
										});
									}
								}
								else {
									const playerColor = player.color;
									if (isPresent) {
										label = intl.formatMessage({
											id: "quintro.components.PlayerIndicators.indicatorMessages.anonymousPlayer.present",
											description: "Label for a player indicator for an anonymous player",
											defaultMessage: "Player {playerColor}",
										}, {
											playerColor,
										});
									}
									else {
										label = intl.formatMessage({
											id: "quintro.components.PlayerIndicators.indicatorMessages.anonymousPlayer.absent",
											description: "Label for a player indicator for an anonymous player that is not present in the game.",
											defaultMessage: "Player {playerColor} is absent",
										}, {
											playerColor,
										});
									}
								}
							}

							return (
								<li
									key={player.color}
									className={classnames([
										classes.item,
										{
											[classes.currentPlayerItem]: player.user.isMe,
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
													user: player.user,
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
									title={intl.formatMessage({
										id: "quintro.components.PlayerIndicators.indicatorMessages.availableSlot",
										description: "Label for a player indicator representing an open spot in the game.",
										defaultMessage: "This spot is open for another player",
									})}
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

export default PlayerIndicators;
