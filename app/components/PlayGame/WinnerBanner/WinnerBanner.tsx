import React from "react";
import { FormattedMessage } from "react-intl";

import Config from "@app/config";


interface WinnerBannerProps {
	winnerColor: string;
	classes?: {
		root: string;
		winMessage: string;
	};
}

const styles = {
	root: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},

	winMessage: {
		fontSize: "5em",
		backgroundColor: "white",
		borderRadius: "0.3em",
		border: "1px solid black",
		padding: "0.2em 1em",
	},
};

function WinnerBanner({
	winnerColor,
	classes = {
		root: "",
		winMessage: "",
	},
}: WinnerBannerProps) {
	return (
		<div
			className={classes.root}
		>
			<div
				className={classes.winMessage}
			>
				<FormattedMessage
					id="quintro.components.PlayGame.WinnerBanner.winMessage"
					description="Message declaring the winning color"
					defaultMessage="{winnerColor} wins!"
					values={{
						winnerColor: Config.game.colors.get(winnerColor).name,
					}}
				/>
			</div>
		</div>
	);
}

export default WinnerBanner;
