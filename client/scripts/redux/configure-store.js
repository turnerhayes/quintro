import {
	createStore,
	applyMiddleware
}                                       from "redux";
import { createLogger }                 from "redux-logger";
import thunkMiddleware                  from "redux-thunk";
import promiseMiddleware                from "redux-promise";
import { persistState }                 from "redux-devtools";
import { composeWithDevTools }          from "redux-devtools-extension";
import { Map }                          from "immutable";
import invariant                        from "redux-immutable-state-invariant";
import { routerMiddleware }             from "react-router-redux";
import createHistory                    from "history/createBrowserHistory";
import rootReducer                      from "project/scripts/redux/reducers";
import { socketMiddleware }             from "project/scripts/socket-middleware";
import Config                           from "project/scripts/config";

export const history = createHistory();

function getDebugSessionKey() {
	const matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
	return (matches && matches.length > 0) ? matches[1] : null;
}

const middlewares = [
	thunkMiddleware,
	promiseMiddleware,
	routerMiddleware(history),
	socketMiddleware
];

let composedEnhancers;

if (Config.app.isDevelopment) {
	middlewares.unshift(invariant());
	middlewares.push(createLogger());

	const composeEnhancers = composeWithDevTools({
		serialize: true
	});
	
	composedEnhancers = composeEnhancers(
		applyMiddleware(...middlewares),
		persistState(getDebugSessionKey())
	);
}
else {
	composedEnhancers = applyMiddleware(...middlewares);
}

export default function configureStore(initialState) {
	return createStore(
		rootReducer,
		initialState || Map(),
		composedEnhancers
	);
}
