import React from "react";
/**
 * Asynchronously loads the component for PlayGame
 */
import Loadable from "react-loadable";

const loadingMessage = () => <div>Loading game&hellip;</div>;

loadingMessage.displayName = "PlayGameLoading";

export default Loadable({
	loader: () => import("./PlayGame"),
	loading: loadingMessage,
});
