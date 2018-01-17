import { Map }                 from "immutable";
import {
	compose,
	createStore,
	applyMiddleware
}                              from "redux";
import thunkMiddleware         from "redux-thunk";
import promiseMiddleware       from "redux-promise";
import {
	persistStore
}                              from "redux-persist-immutable";
import { persistState }        from "redux-devtools";
import { composeWithDevTools } from "redux-devtools-extension";
import localForage             from "localforage";
import invariant               from "redux-immutable-state-invariant";
import { routerMiddleware }    from "react-router-redux";
import createHistory           from "history/createBrowserHistory";
import rootReducer             from "project/scripts/redux/reducers";
import { socketMiddleware }    from "project/scripts/socket-middleware";
import notificationMiddleware  from "project/scripts/notification-middleware";
import Config                  from "project/scripts/config";

export const history = createHistory();

function getDebugSessionKey() {
	const matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
	return (matches && matches.length > 0) ? matches[1] : null;
}

const middlewares = [
	thunkMiddleware,
	promiseMiddleware,
	routerMiddleware(history),
	socketMiddleware,
	notificationMiddleware
];

const composer = Config.app.isDevelopment ?
	composeWithDevTools({
		serialize: true
	}) :
	compose;

const enhancers = [];

if (Config.app.isDevelopment) {
	middlewares.unshift(invariant());
	
	enhancers.push(
		applyMiddleware(...middlewares),
		persistState(getDebugSessionKey())
	);
}
else {
	enhancers.push(applyMiddleware(...middlewares));
}

const composedEnhancers = composer(...enhancers);

export default function configureStore(initialState) {
	let store = createStore(
		rootReducer,
		initialState || Map(),
		composedEnhancers
	);

	persistStore(
		store,
		{
			storage: localForage,
			whitelist: [
				"settings"
			]
		}
	);

	return store;
}
