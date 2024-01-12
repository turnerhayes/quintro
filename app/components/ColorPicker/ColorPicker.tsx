import React, { DOMElement, useCallback, useState } from "react";
import {Map} from "immutable";
// import { withStyles } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Config, {PlayerColor} from "@app/config";
// import gameSelectors from "@app/selectors/games/game";

import ColorSwatch from "./ColorSwatch";
import {Game} from "@shared/game";


// TODO: FIX
const gameSelectors = {
	getPlayerColors(game: any) {
		return [];
	}
}

interface ColorPickerProps {
	game: Game;
	selectedColor?: string;
	onColorChosen: ({ color }: { color: string; }) => void;
	classes?: {
		root: string;
	};
}

function colorFilterForGame({ color, game }) {
	return !gameSelectors.getPlayerColors(game).includes(color.id);
}

const styles = {
	root: {
		display: "inline-block",
	},
};
// static propTypes = {
// 	classes: PropTypes.object.isRequired,
// 	game: ImmutablePropTypes.map,
// 	onColorChosen: PropTypes.func.isRequired,
// 	selectedColor: PropTypes.oneOf(Config.game.colors.map(({ id }) => id)),
// };

/**
 * Renders an option for the color picker dropdown.
 *
 * @function
 *
 * @param {object} colorDefinition - the color definition object for the color to render
 * @param {object} [rootProps] - additional props to add to the wrapper element
 */
const renderColorOptionContent = (colorDefinition: PlayerColor, rootProps?: any) => {
	return (
		<span
			{...rootProps}
		>
			<ColorSwatch
				color={colorDefinition.id}
			/>
			{colorDefinition.name}
		</span>
	);
};

const getDefaultColorForGame = ({ game }) => {
	const colors = Config.game.colors.filter(
		(color) => colorFilterForGame({ color, game })
	);

	return colors.length > 0 ? colors[0].id : undefined;
};

const ColorPicker = ({
	game,
	selectedColor,
	onColorChosen,
	classes = {
		root: "",
	},
}: ColorPickerProps) => {
	const [colorDisplayEl, setColorDisplayEl] = useState<Element|null>(null);
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

	const defaultColor = game ?
		// if there's a game, use it to find the first unclaimed color
		ColorPicker.getDefaultColorForGame({ game }) :
		// If there's no game and no default color getter prop, just take the first
		Config.game.colors[0].id;

	const handleCurrentColorClicked = useCallback((event) => {
		setColorDisplayEl(event.target);
		setIsColorPickerOpen(true);
	}, [setColorDisplayEl, setIsColorPickerOpen]);

	/**
	 * Closes the player color dropdown.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const closeColorPicker = useCallback(() => {
		setIsColorPickerOpen(false);
	}, [setIsColorPickerOpen]);

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
	const handleColorClicked = useCallback(({ color }) => {
		closeColorPicker();

		onColorChosen({ color });
	}, [onColorChosen, closeColorPicker]);

	
	let colors = [...Config.game.colors];
	
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
			className={classes.root}
		>
			<Button
				key="color-change-button"
				onClick={handleCurrentColorClicked}
			>
				{
					renderColorOptionContent(
						Config.game.colors.get(selectedColor || defaultColor),
					)
				}
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
								<MenuItem
									key={colorDefinition.id}
									data-color={colorDefinition.id}
									selected={colorDefinition.id === (selectedColor || defaultColor)}
									onClick={() => handleColorClicked({
										color: colorDefinition.id
									})}
								>
									{ renderColorOptionContent(colorDefinition) }
								</MenuItem>
							);
						}
					)
				}
			</Menu>
		</div>
	);
}

ColorPicker.getDefaultColorForGame = getDefaultColorForGame;

export default ColorPicker;

// const WrappedComponent = withStyles(styles)(ColorPicker);

// WrappedComponent.getDefaultColorForGame = ColorPicker.getDefaultColorForGame;

// export default WrappedComponent;
