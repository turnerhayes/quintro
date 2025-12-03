import React, { type MouseEvent, type ReactNode, useCallback }              from "react";
import { useIntl } from "react-intl";
import classNames from "classnames";

import { Marble }         from "@/client/components/Marble";
import type { Game, Player, PlayerPresence } from "@/types";
import styles from "./PlayerIndicators.module.css";
import { getCurrentPlayer } from "@/client/redux/selectors/game";
import { useTheme } from "@mui/material";

const MARBLE_SIZE = {
	absent: "2.4em",
	normal: "3em",
};

export interface PlayerIndicatorProps {
	player: Player|null;
	index: number;
	title: string;
	children: ReactNode|ReactNode[];
	markActive: boolean;
	isActive: boolean;
	indicatorProps?: IndicatorProps|IndicatorPropsFunction;
	className?: string;
	onClick: (args: {
		player: Player|null;
		index: number;
		element: HTMLElement;
	}) => void;
}

export type IndicatorProps = Omit<React.JSX.IntrinsicElements["li"], "onClick">;

export type IndicatorPropsFunction = (args: {
	player: Player|null;
	index: number;
	active: boolean;
	isPresent: boolean;
}) => IndicatorProps;

export interface PlayerIndicatorsProps {
	game: Game;
	markActive: boolean;
	onIndicatorClick?: (args: {
		selectedPlayer: Player|null;
		index: number;
		element: HTMLElement;
	}) => void;
	indicatorProps?: IndicatorProps|IndicatorPropsFunction;
	playerPresence: PlayerPresence;
	className?: string;
}

const PlayerIndicator = (
	{
		player,
		index,
		title,
		children,
		indicatorProps,
		markActive,
		isActive,
		onClick,
		className,
	}: PlayerIndicatorProps
) => {
	const theme = useTheme();
	const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
		onClick({
			player,
			index,
			element: event.target as HTMLElement,
		});
	}, [
		onClick,
	]);

	const props = typeof indicatorProps === "function" ?
		indicatorProps({
			player,
			index,
			active: isActive,
			isPresent: false,
		}) :
		indicatorProps;

	return (
		<li
			role="button"
			className={classNames([
				className,
				styles.indicator,
				{
					[styles.currentPlayerItem]: player != null && 'isMe' in player,
					[styles.activeItem]: isActive && markActive,
				}
			])}
			style={{
				color: theme.palette.text.primary,
			}}
			onClick={handleClick}
			title={title}
			{
				...props
			}
		>
			{children}
		</li>
	);
};

/**
 * Component representing a set of indicators for visualizing the state of the
 * players in the game.
 *
 * @memberof client.react-components
 */
export const PlayerIndicators = (
	{
		game,
		markActive,
		onIndicatorClick,
		indicatorProps,
		playerPresence,
		className,
	}: PlayerIndicatorsProps
) => {
	const intl = useIntl();
	const currentPlayerColor = getCurrentPlayer(game)?.color;
	const handlePlayerIndicatorClick = useCallback((
		{
			player,
			index,
			element,
		}: {
			player: Player|null;
			index: number;
			element: HTMLElement;
		}
	) => {
		onIndicatorClick && onIndicatorClick({ selectedPlayer: player, index, element });
	}, [
		onIndicatorClick,
	]);

	return (
		<div
			className={className}
		>
			<ul
				className={styles.list}
			>
				{
					game.players.map(
						(player, index) => {
							const isPresent = Boolean(playerPresence[player.color]); // TODO: Handle presence

							let label: string;

							if ("isMe" in player) {
								label = intl.formatMessage({
									id: "quintro.components.PlayerIndicators.indicatorMessages.you",
									defaultMessage: "This is you",
								});
							}
							else {
								if (player.user?.name.display) {
									if (isPresent) {
										label = player.user.name.display;
									}
									else {
										label = intl.formatMessage({
											id: "quintro.components.PlayerIndicators.indicatorMessages.namedPlayer.absent",
											defaultMessage: "{playerName} is absent",
										}, {
											playerName: player.user.name.display,
										});
									}
								}
								else {
									if (isPresent) {
										label = intl.formatMessage({
											id: "quintro.components.PlayerIndicators.indicatorMessages.anonymousPlayer.present",
											defaultMessage: "Player {playerColor}",
										}, {
											playerColor: player.color,
										});
									}
									else {
										label = intl.formatMessage({
											id: "quintro.components.PlayerIndicators.indicatorMessages.anonymousPlayer.absent",
											defaultMessage: "Player {playerColor} is absent",
										}, {
											playerColor: player.color,
										});

									}
								}
							}

							return (
								<PlayerIndicator
									key={player.color}
									player={player}
									index={index}
									indicatorProps={indicatorProps}
									title={label}
									markActive={markActive}
									isActive={player.color == currentPlayerColor}
									onClick={handlePlayerIndicatorClick}
								>
									<Marble
										color={player.color}
										size={
											!isPresent ?
												MARBLE_SIZE.absent :
												MARBLE_SIZE.normal
										}
									/>
								</PlayerIndicator>
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
						(_, index) => {
							index = index + game.players.length;

							return (
								<PlayerIndicator
									key={`not-filled-player-${index}`}
									player={null}
									index={index}
									markActive={false}
									isActive={false}
									onClick={handlePlayerIndicatorClick}
									title={
										intl.formatMessage({
											id:"quintro.components.PlayerIndicators.indicatorMessages.availableSlot",
											defaultMessage: "This spot is open for another player.",
										})
									}
									indicatorProps={indicatorProps}
								>
									<Marble
										size={MARBLE_SIZE.normal}
										color={null}
									/>
								</PlayerIndicator>
							);
						}
					)
				}
			</ul>
		</div>
	);
}
