import { combineReducers } from "redux-immutable";
import routerReducer       from "project/scripts/redux/reducers/router";
import settingsReducer     from "project/scripts/redux/reducers/settings";
import usersReducer        from "project/scripts/redux/reducers/users";
import gamesReducer        from "project/scripts/redux/reducers/games";

export default combineReducers({
	users: usersReducer,
	games: gamesReducer,
	routing: routerReducer,
	settings: settingsReducer,
	lastAction: (state, action) => action
});
