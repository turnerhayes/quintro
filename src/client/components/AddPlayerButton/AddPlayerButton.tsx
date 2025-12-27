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
	const [color, setColor] = useState<ColorID|null>(
		getDefaultColorForGame({
			game,
		}) ?? null
	);

	const handleClick = useCallback(() => {
		/* v8 ignore start */
		if (!color) {
			// This should never happen; the only way to not have a color is if all colors are taken,
			// in which case the button should be disabled.
			throw new Error('Cannot add player without a color selected');
		}
		/* v8 ignore end */
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
				disabled={!color}
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
