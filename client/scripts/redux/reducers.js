import { combineReducers } from "redux-immutable";
import routerReducer       from "project/scripts/redux/reducers/router";
import usersReducer        from "project/scripts/redux/reducers/users";
import gamesReducer        from "project/scripts/redux/reducers/games";

export default combineReducers({
	users: usersReducer,
	games: gamesReducer,
	routing: routerReducer,
	lastAction: (state, action) => action
});
