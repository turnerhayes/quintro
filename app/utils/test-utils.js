import React from "react";
import { IntlProvider } from "react-intl";
import configureStore from "redux-mock-store";
import { runSaga as realRunSaga } from "redux-saga";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { translationMessages } from "@app/i18n";

import createReducer from "@app/reducers";

const intlProvider = new IntlProvider({
	locale: "en",
	messages: translationMessages.en,
	textComponent: React.Fragment,
}, {});

export const { intl } = intlProvider.getChildContext();

export const formatMessage = intl.formatMessage.bind(intl);

const _mockStore = configureStore();

export const mockStore = (initialState, ...args) => {
	if (!initialState) {
		initialState = createReducer()(undefined, {});
	}

	const store = _mockStore(initialState, ...args);

	store.injectedReducers = {};
	store.injectedSagas = {};

	store.runSaga = () => {};

	return store;
};

export function wrapWithProviders(
	children,
	{
		store = mockStore(),
		locale = "en",
		initialEntries,
		initialIndex,
	} = {}
) {

	return (
		<Provider store={store}>
			<IntlProvider
				locale={locale}
				messages={translationMessages[locale]}
				textComponent={React.Fragment}
			>
				<MemoryRouter
					initialEntries={initialEntries}
					initialIndex={initialIndex}
				>
					{children}
				</MemoryRouter>
			</IntlProvider>
		</Provider>
	);
}

export async function runSaga({
	state,
	getSaga,
}, ...args) {
	const dispatched = [];

	const rootSaga = await getSaga();

	const dispatchers = [];

	const reducer = createReducer();

	state = state || reducer(undefined, {});

	const getDispatch = (pushToArray = true) => {
		return (action) => {
			if (pushToArray) {
				dispatched.push(action);
			}

			state = reducer(state, action);
		};
	};

	const dispatchWithoutPushing = getDispatch(false);

	const sagaPromise = realRunSaga(
		{
			dispatch: getDispatch(),
			getState: () => state,
			subscribe: (callback) => {
				const wrappedCallback = (action, ...args) => {
					dispatchWithoutPushing(action);
					return callback(action, ...args);
				};

				dispatchers.push(wrappedCallback);

				return () => {
					const index = dispatchers.findIndex(wrappedCallback);

					if (index >= 0) {
						delete dispatchers[index];
					}
				};
			},
		},
		rootSaga,
		...args
	).done;

	return {
		dispatchers,
		dispatched,
		sagaPromise,
	};
}
