/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from "redux-immutable";
import { Map } from "immutable";
import { LOCATION_CHANGE } from "react-router-redux";
import usersReducer from "@app/reducers/users";
import gamesReducer from "@app/reducers/games";
import uiReducer from "@app/reducers/ui";
import settingsReducer from "@app/reducers/settings";

/*
 * routeReducer
 *
 * The reducer merges route location changes into our immutable state.
 * The change is necessitated by moving to react-router-redux@4
 *
 */

// Initial routing state
const routeInitialState = Map({
	location: null,
});

/**
 * Merge route into the global application state
 */
function routeReducer(state = routeInitialState, action) {
	switch (action.type) {
		/* istanbul ignore next */
		case LOCATION_CHANGE:
			return state.merge({
				location: action.payload,
			});
		default:
			return state;
	}
}

/**
 * Creates the main reducer with the dynamically injected ones
 */
export default function createReducer(injectedReducers) {
	return combineReducers({
		route: routeReducer,
		users: usersReducer,
		games: gamesReducer,
		settings: settingsReducer,
		ui: uiReducer,
		...injectedReducers,
	});
}
