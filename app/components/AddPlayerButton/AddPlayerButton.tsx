import React, { useCallback, useEffect, useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";

// import gameSelectors from "@app/selectors/games/game";
import ColorPicker from "@app/components/ColorPicker";

import {Game} from "@shared/game";
import { useIntl } from "react-intl";



const styles = {
	root: {},

	// Icomoon icons are off center in Material UI 
	icomoonIcon: {
		transform: "translate(-50%)",
	},
};

// TODO: FIX
const gameSelectors = {
	canAddPlayerColor(game, { color }: { color: string; }) {
		return true;
	}
}

interface AddPlayerButtonProps {
	game: Game;
	onAdd: ({ color }: {color: string;}) => void;
	className?: string;
	classes?: {
		root: string;
		icomoonIcon: string;
	};
}

const AddPlayerButton = ({
	game,
	onAdd,
	className,
	classes = {
		root: "",
		icomoonIcon: "",
	},
}: AddPlayerButtonProps) => {
	const intl = useIntl();
	const [color, setColor] = useState<string|null>(null);

	const ref = useRef();
	useEffect(() => {
		if (!ref.current) {
			setColor(ColorPicker.getDefaultColorForGame({
				game,
			}));
		}
		if (!gameSelectors.canAddPlayerColor(game, { color })) {
			setColor(ColorPicker.getDefaultColorForGame({
				game,
			}));
		}
	}, [setColor, game]);

	const handleClick = useCallback(() => {
		onAdd({
			color,
		});
	}, [onAdd, color]);

	const handleColorChosen = useCallback(({ color }) => {
		setColor(color);
	}, [setColor]);

	const title = intl.formatMessage({
		id: "quintro.components.AddPlayerButton.buttonTitle",
		description: "Title of the Add Player button",
		defaultMessage: "Add Player",
	});

	return (
		<div
			className={className || classes.root}
		>
			<IconButton
				onClick={handleClick}
				aria-label={title}
				title={title}
			>
				<div
					className={`icon ${classes.icomoonIcon}`}
				>add player</div>
			</IconButton>
			{
				color !== undefined && (
					<ColorPicker
						game={game}
						onColorChosen={handleColorChosen}
						selectedColor={color}
					/>
				)
			}
		</div>
	);
};

export default AddPlayerButton;
