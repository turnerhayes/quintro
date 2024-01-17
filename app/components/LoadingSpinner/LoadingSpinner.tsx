import React             from "react";
import classnames        from "classnames";
import {Icon}              from "@mui/material";

import                        "@app/fonts/icomoon/style.css";

const styles = {
	"@keyframes quintro-loading-spinner--spin": {
		from: {
			transform: "rotateZ(0deg)",
		},

		to: {
			transform: "rotateZ(-359deg)",
		},
	},

	root: {
		display: "inline-block",
		animation: "quintro-loading-spinner--spin 1s infinite linear",
	},
};

function LoadingSpinner({
	classes = {
		root: "",
	},
}: {
	classes?: {
		root: string;
	};
}) {
	return (
		<Icon
			className={classnames(
				"icon",
				classes.root
			)}
		>
			loading
		</Icon>
	);
}

export default LoadingSpinner;
