import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "material-ui/styles";
import Config from "@app/config";

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

function WinnerBanner({ winnerColor, classes }) {
	// TODO: Add i18n
	return (
		<div
			className={classes.root}
		>
			<div
				className={classes.winMessage}
			>{Config.game.colors.get(winnerColor).name} wins!</div>
		</div>
	);
}

WinnerBanner.propTypes = {
	winnerColor: PropTypes.oneOf(Config.game.colors.map((color) => color.id)),
	classes: PropTypes.object.isRequired,
};

export { WinnerBanner as Unwrapped };

export default withStyles(styles)(WinnerBanner);
