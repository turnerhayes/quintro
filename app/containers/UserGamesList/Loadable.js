import React from "react";
/**
 * Asynchronously loads the component for UserGamesList
 */
import Loadable from "react-loadable";

const loadingMessage = () => <div>Loading user&#39;s games</div>;

loadingMessage.displayName = "UserGamesListLoading";

export default Loadable({
	loader: () => import("./UserGamesList"),
	loading: loadingMessage,
});
