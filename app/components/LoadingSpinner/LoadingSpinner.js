import React             from "react";
import Icon              from "material-ui/Icon";
import                        "@app/fonts/icomoon/style.less";
import                        "./LoadingSpinner.less";


export default function LoadingSpinner() {
	return (
		<Icon
			className="qc-loading-spinner icon"
		>
			loading
		</Icon>
	);
}
