import { FormattedMessage } from "react-intl";
import Button from "@mui/material/Button";
import { alpha, Box, useTheme } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";


export interface StartGameOverlayProps {
	canStart: boolean;
	onStartClick: () => void;
}

export const StartGameOverlay = (
    {
        canStart,
        onStartClick,
    }: StartGameOverlayProps
) => {
	const theme = useTheme();

	return (
		<Box
			sx={(theme) => ({
				position: "absolute",
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				backgroundColor: alpha(theme.palette.grey[700], 0.6),
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: "modal",
			})}
		>
			{
				<Box
					sx={{
						fontSize: "5em",
					}}
				>
					<Button
						disabled={!canStart}
						onClick={onStartClick}
						variant="contained"
						sx={{
							"&[disabled]": {
								opacity: 0.65,
								background: theme.palette.primary.light,
								color: theme.palette.primary.contrastText,
								cursor: "not-allowed",
							},
						}}
					>
						<PlayArrowIcon
						/>
						<FormattedMessage
							id="quintro.components.PlayGame.StartGameOverlay.buttonText"
							defaultMessage="Start Game"
						/>
					</Button>
				</Box>
			}
		</Box>
	);
}
