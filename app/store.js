/**
 * Configures the Redux store for use on the browser. Separate from configure-store.js both so
 * that configure-store.js could be used server-side (without a DOM reference) and so that other
 * client-side modules can get a reference to the store if needed.
 */

import { Map }               from "immutable";
import createHistory         from "history/createBrowserHistory";
import configureStore        from "@app/configure-store";
import { initializeClients } from "@app/api/clients";

export const history = createHistory();

const context = JSON.parse(document.body.dataset.context || "{}");

const currentUser = context && context.user ? Map(context.user) : null;

const initialState = Map(
	{
		users: Map(
			{
				currentID: currentUser && currentUser.get("id"),
				items: currentUser ? Map([[currentUser.get("id"), currentUser]]) : Map()
			}
		)
	}
);

let store;

export default function getStore() {
	if (!store) {
		store = configureStore(initialState, history);

		initializeClients({ store });

		/// DEBUG
		window.__store = store;
		/// END DEBUG
	}

	return store;
}
