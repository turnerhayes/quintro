import React             from "react";
import PropTypes         from "prop-types";
import Icon              from "material-ui/Icon";
import createClassHelper from "@app/components/class-helper";
import                        "@app/fonts/icomoon/style.less";
import                        "./LoadingSpinner.less";

const classes = createClassHelper("loading-spinner");

export default function LoadingSpinner({
	isLarge
}) {
	return (
		<Icon
			{...classes({
				extra: "icon",
				modifiers: [
					isLarge && "large",
				],
			})}
		>
			loading
		</Icon>
	);
}

LoadingSpinner.propTypes = {
	isLarge: PropTypes.bool,
};

LoadingSpinner.defaultProps = {
	isLarge: false,
};
