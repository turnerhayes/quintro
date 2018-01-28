import React from "react";
/**
 * Asynchronously loads the component for FindGame page
 */
import Loadable from "react-loadable";

const loadingMessage = () => <div>Loading FindGame page</div>;

loadingMessage.displayName = "FindGameLoading";

export default Loadable({
	loader: () => import("./FindGameContainer"),
	loading: loadingMessage,
});
