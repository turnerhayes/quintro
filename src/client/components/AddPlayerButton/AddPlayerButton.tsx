import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import IconButton from "@mui/material/IconButton";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import { ColorPicker, getDefaultColorForGame } from "@/client/components/ColorPicker";
import { type ColorID } from "@/config";
import type { Game } from "@/types";
import { canAddColor } from "@/client/redux/selectors/game";
import { Stack } from "@mui/material";

export interface AddPlayerButtonProps {
	game: Game;
	onAdd: (args: {color: ColorID;}) => void;
	className?: string;
}

export const AddPlayerButton = (
	{
		game,
		onAdd,
		className,
	}: AddPlayerButtonProps
) => {
	const intl = useIntl();
	const [color, setColor] = useState<ColorID|null>(null);

	useEffect(() => {
		setColor(
			getDefaultColorForGame({
				game,
			}) || null
		);
	}, []);

	const canAdd = color != null && canAddColor(game, color);

	useEffect(() => {
		if (!canAdd) {
			setColor(
				getDefaultColorForGame({
					game,
				}) || null
			);
		}
	}, [
		game,
		setColor,
	]);

	const handleClick = useCallback(() => {
		if (!color) {
			throw new Error('Cannot add player without a color selected');
		}
		onAdd({
			color,
		});
	}, [
		onAdd,
		color,
	]);

	const handleColorChosen = useCallback(({ color }: { color: ColorID; }) => {
		setColor(color);
	}, [
		setColor,
	]);

	const title = intl.formatMessage({
		id: "quintro.components.AddPlayerButton.buttonTitle",
		defaultMessage: "Add Player",
	});

	return (
		<Stack
			className={className}
			direction="row"
		>
			<IconButton
				onClick={handleClick}
				aria-label={title}
				title={title}
			>
				<PersonAddIcon
				/>
			</IconButton>
			{
				color !== null && (
					<ColorPicker
						game={game}
						onColorChosen={handleColorChosen}
						selectedColor={color}
					/>
				)
			}
		</Stack>
	);
}
