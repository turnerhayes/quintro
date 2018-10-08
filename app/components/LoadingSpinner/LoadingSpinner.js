import React             from "react";
import PropTypes         from "prop-types";
import classnames        from "classnames";
import { withStyles }    from "@material-ui/core/styles";
import Icon              from "@material-ui/core/Icon";

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

function LoadingSpinner({ classes }) {
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

LoadingSpinner.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LoadingSpinner);
