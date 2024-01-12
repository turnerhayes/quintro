import React from "react";
import PropTypes from "prop-types";
// import { withStyles } from "@mui/material/styles";

import Config from "@app/config";

interface ColorSwatchProps {
	color: string;
	classes?: {
		root: string;
	};
}

function ColorSwatch({
	color,
	classes = {
		root: "",
	},
}: ColorSwatchProps) {
	return (
		<span
			className={classes.root}
			style={{backgroundColor: Config.game.colors.get(color).hex}}
		/>
	);
}

export default ColorSwatch;
// export default withStyles(styles)(ColorSwatch);
