/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from "redux-immutable";
import { connectRouter } from "connected-react-router/immutable";
import createHistory from "history/createBrowserHistory";
import usersReducer from "@app/reducers/users";
import gamesReducer from "@app/reducers/games";
import uiReducer from "@app/reducers/ui";
import settingsReducer from "@app/reducers/settings";

/**
 * Creates the main reducer with the dynamically injected ones
 */
export default function createReducer({
	injectedReducers,
	history = createHistory(),
} = {}) {
	return combineReducers({
		router: connectRouter(history),
		users: usersReducer,
		games: gamesReducer,
		settings: settingsReducer,
		ui: uiReducer,
		...injectedReducers,
	});
}
