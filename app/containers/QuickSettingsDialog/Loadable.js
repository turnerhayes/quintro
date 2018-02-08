import React from "react";
/**
 * Asynchronously loads the component for QuickSettingsDialog
 */
import Loadable from "react-loadable";

const loadingMessage = () => <div>Loading Quick Settings Dialog</div>;

loadingMessage.displayName = "QuickSettingsDialogLoading";

export default Loadable({
	loader: () => import("./QuickSettingsDialog"),
	loading: loadingMessage,
});
