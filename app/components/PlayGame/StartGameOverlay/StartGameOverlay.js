import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { withStyles } from "material-ui/styles";
import Button from "material-ui/Button";
import PlayArrowIcon from "material-ui-icons/PlayArrow";

const styles = {
	root: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		backgroundColor: "rgba(180, 180, 180, 0.6)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},

	dialog: {
		fontSize: "5em",
	},

	startButton: {
		backgroundColor: "#FFFFFF",
	},

	disabledButton: {
		opacity: 1,
		color: "rgba(51, 51, 51, 0.65)",
	},
};

function StartGameOverlay({ canStart, onStartClick, classes }) {
	return (
		<div
			className={classes.root}
		>
			{
				<div
					className={classes.dialog}
				>
					<Button
						disabled={!canStart}
						onClick={onStartClick}
						className={classnames(
							classes.startButton,
							{
								[classes.disabledButton]: !canStart,
							}
						)}
					>
						<PlayArrowIcon
						/>
						Start Game
					</Button>
				</div>
			}
		</div>
	);
}

StartGameOverlay.propTypes = {
	onStartClick: PropTypes.func.isRequired,
	canStart: PropTypes.bool,
	classes: PropTypes.object,
};

export default withStyles(styles)(StartGameOverlay);
