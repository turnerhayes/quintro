import React from "react";
import { FormattedMessage } from "react-intl";
import classNames from "classnames";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import * as styles from "./StartGameOverlay.module.scss";


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
	return (
		<div
			className={styles.root}
		>
			{
				<div
					className={styles.dialog}
				>
					<Button
						disabled={!canStart}
						onClick={onStartClick}
						className={classNames(
							styles.startButton,
							{
								[styles.disabledButton]: !canStart,
							}
						)}
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
