import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Config from "@app/config";

const styles = {
	root: {
		display: "inline-block",
		width: "1.5em",
		height: "1.5em",
		borderRadius: "100%",
		marginRight: "0.5em",
	}
};

function ColorSwatch({ color, classes }) {
	return (
		<span
			className={classes.root}
			style={{backgroundColor: Config.game.colors.get(color).hex}}
		/>
	);
}

ColorSwatch.propTypes = {
	classes: PropTypes.object.isRequired,
	color: PropTypes.oneOf(Config.game.colors.map(({ id }) => id)),
};

export default withStyles(styles)(ColorSwatch);
