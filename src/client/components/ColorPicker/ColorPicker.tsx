import { type MouseEvent, useCallback, useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Config, { type ColorDefinition, type ColorID } from "@/config";
import type { Game } from "@/types";

import { ColorSwatch } from "./ColorSwatch";
import styles from "./ColorPicker.module.css";
import { useIntl } from "react-intl";


function colorFilterForGame(
	{
		color,
		game,
	}: {
		color: ColorDefinition;
		game: Game;
	}
): boolean {
	return !game.players.find((player) => player.color === color.id);
}


export const getDefaultColorForGame = (
	{
		game,
	}: {
		game: Game;
	}
) => {
	const playerColors = game.players.map((player) => player.color);
	const colors = Config.game.colors.filter(
		(color) => !playerColors.includes(color.id)
	);

	return colors.length > 0 ? colors[0].id : undefined;
};

const ColorOption = (
	{
		colorDefinition,
	}: {
		colorDefinition: ColorDefinition;
	}
) => {
	return (
		<span
			style={{
				display: "flex",
			}}
		>
			<ColorSwatch
				color={colorDefinition.id}
			/>
			{colorDefinition.name}
		</span>
	);
};

const ColorMenuItem = (
	{
		color,
		selected,
		onClick,
	}: {
		color: ColorDefinition;
		selected: boolean;
		onClick: (args: {color: ColorID;}) => void;
	}
) => {
	const handleClick = useCallback(() => {
		onClick({
			color: color.id,
		});
	}, [
		onClick,
		color,
	]);

	return (
		<MenuItem
			data-color={color.id}
			selected={selected}
			onClick={handleClick}
		>
			<ColorOption
				colorDefinition={color}
			/>
		</MenuItem>
	);
};

export interface ColorPickerProps {
	game: Game;
	selectedColor?: ColorID;
	onColorChosen: (args: {color: ColorID;}) => void;
}

export const ColorPicker = (
	{
		game,
		selectedColor,
		onColorChosen,
	}: ColorPickerProps
) => {
	const [colorDisplayEl, setColorDisplayEl] = useState<HTMLElement|null>(null);
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
	const intl = useIntl();

	const getDefaultColor = useCallback(() => {
		// If there's no game and no default color getter prop, just take the first
		if (!game) {
			return Config.game.colors[0].id;
		}

		// if there's a game, use it to find the first unclaimed color
		return getDefaultColorForGame({ game });
	}, [
		game,
	]);

	const handleCurrentColorClicked = useCallback((event: MouseEvent<HTMLElement>) => {
		setColorDisplayEl(event.currentTarget);
		setIsColorPickerOpen(true);
	}, [
		setColorDisplayEl,
		setIsColorPickerOpen,
	]);

	/**
	 * Closes the player color dropdown.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const closeColorPicker = useCallback(() => {
		setIsColorPickerOpen(false);
		setColorDisplayEl(null);
	}, [
		setIsColorPickerOpen,
		setColorDisplayEl,
	]);
	
	/**
	 * Handles a player color being clicked.
	 *
	 * @function
	 *
	 * @param {object} args - the function arguments
	 * @param {object} args.color - the color ID for the selected color
	 *
	 * @return {void}
	 */
	const handleColorClicked = useCallback((
		{
			color,
		}: {
			color: ColorID;
		}
	) => {
		closeColorPicker();

		onColorChosen({ color });
	}, [
		closeColorPicker,
		onColorChosen,
	]);

	const defaultColor = getDefaultColor();

	const title = intl.formatMessage({
		id: "quintro.components.ColorPicker.title",
		defaultMessage: "Choose Player Color",
	});

	let colors: ColorDefinition[] = Config.game.colors;
	
	if (game) {
		colors = colors.filter(
			(color) => colorFilterForGame({
				color,
				game,
			})
		);
	}

	return (
		<div
			className={styles.root}
		>
			<Button
				key="color-change-button"
				onClick={handleCurrentColorClicked}
				title={title}
				aria-label={title}
			>
				<ColorOption
					colorDefinition={Config.game.colors.get(selectedColor || defaultColor!)}
				/>
			</Button>
			<Menu
				open={isColorPickerOpen}
				onClose={closeColorPicker}
				anchorEl={colorDisplayEl}
			>
				{
					colors.map(
						(colorDefinition) => {
							return (
								<ColorMenuItem
									key={colorDefinition.id}
									color={colorDefinition}
									selected={colorDefinition.id === (selectedColor || defaultColor)}
									onClick={handleColorClicked}
								/>
							);
						}
					)
				}
			</Menu>
		</div>
	);
}
