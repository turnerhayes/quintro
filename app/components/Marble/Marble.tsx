import React          from "react";
import classnames     from "classnames";
// import { withStyles } from "@mui/material/styles";
import Config         from "@app/config";


interface MarbleProps {
	color: string|null;
	size?: string;
	className?: string;
	classes?: {
		empty: string;
	};
}


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

const Marble = ({
	color,
	size = "1em",
	className,
	classes = {
		empty: "",
	},
}: MarbleProps) => {
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

export { Marble as Unwrapped };

export default Marble;

// export default withStyles(styles)(Marble);
