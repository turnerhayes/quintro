import React          from "react";
import PropTypes      from "prop-types";
import classnames     from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Config         from "@app/config";

const commonStyles = {
	borderRadius: "100%",
};

const styles = {
	empty: {
		...commonStyles,
		background: "lightgrey",
	},

	...Config.game.colors.reduce(
		(colorStyles, color) => {
			colorStyles[`color-${color.id}`] = {
				...commonStyles,
				background: `radial-gradient(circle at 10px 7px, ${color.hex}, #FFFFFF)`,
			};

			return colorStyles;
		},
		{}
	),
};

function Marble({ color, size = "1em", className, classes }) {
	return (
		<div
			className={classnames([
				className,
				color === null ?
					classes.empty :
					classes[`color-${color}`],
			])}
			style={{
				width: size,
				height: size,
				minWidth: size,
				maxWidth: size,
				minHeight: size,
				maxHeight: size,
			}}
		></div>
	);
}

Marble.propTypes = {
	color: PropTypes.oneOf([
		...Config.game.colors.map((color) => color.id),
		// null represents a marble that has no color (e.g. in PlayerIndicators
		// when there's a player space not filled)
		null,
	]),
	size: PropTypes.string,
	className: PropTypes.string,
	classes: PropTypes.object,
};

export { Marble as Unwrapped };

export default withStyles(styles)(Marble);
