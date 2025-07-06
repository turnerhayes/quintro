import { FormattedMessage } from "react-intl";
import classNames from "classnames";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import styles from "./StartGameOverlay.module.css";
import { useTheme } from "@mui/material";


export interface StartGameOverlayProps {
	canStart: boolean;
	onStartClick: () => void;
	className?: string;
}

export const StartGameOverlay = (
    {
        canStart,
        onStartClick,
		className,
    }: StartGameOverlayProps
) => {
	const theme = useTheme();

	return (
		<div
			className={classNames(
				styles.root,
				className
			)}
		>
			{
				<div
					className={styles.dialog}
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
				</div>
			}
		</div>
	);
}
