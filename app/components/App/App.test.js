import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router";
import createSagaMiddleware from "redux-saga";
import fetchMock from "fetch-mock";
import Loadable from "react-loadable";
import * as immutableMatchers from "jest-immutable-matchers";
import { wrapWithIntlProvider } from "@app/utils/test-utils";
import _App from "./index";

const App = wrapWithIntlProvider(_App);
const sagaMiddleware = createSagaMiddleware();

const mockStore = configureStore([
	sagaMiddleware,
]);

function createStore(initialState) {
	const store = mockStore(initialState);

	store.runSaga = sagaMiddleware.run;
	store.injectedReducers = {};
	store.injectedSagas = {};

	return store;
}


beforeAll(() => {
	fetchMock.get("*", {});

	jest.addMatchers(immutableMatchers);

	// Make sure that Loadable containers are loaded so that we don't get
	// an not-yet-loaded Loadable component when we render the routes
	return Loadable.preloadAll();
});

describe("App component", () => {
	it("should render a HomePage component for the / route", () => {
		const initialState = fromJS({
			users: {
				items: {},
			},
			games: {
				items: {},
			},
		});

		const wrapper = mount(
			<Provider
				store={createStore(initialState)}
			>
				<MemoryRouter
					initialEntries={[ `/` ]}
				>
					<App
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find("HomePage")).toExist();
	});

	it("should render a UserGamesList component in the sidebar for the / route", () => {
		const initialState = fromJS({
			users: {
				items: {},
			},
			games: {
				items: {},
			},
		});

		const wrapper = mount(
			<Provider
				store={createStore(initialState)}
			>
				<MemoryRouter
					initialEntries={[ `/` ]}
				>
					<App
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find(".page-layout__left-panel").find("UserGamesList")).toExist();
	});

	it("should render a PlayGame component for the /play/:game route", () => {
		const gameName = "testgame";

		const game = fromJS({
			name: gameName,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			players: [],
			isLoaded: true,
		});

		const initialState = fromJS({
			users: {
				items: {},
			},
			games: {
				items: {
					[gameName]: game,
				},
			},
		});

		const wrapper = mount(
			<Provider
				store={createStore(initialState)}
			>
				<MemoryRouter
					initialEntries={[ `/play/${gameName}` ]}
				>
					<App
					/>
				</MemoryRouter>
			</Provider>
		);

		const component = wrapper.find("PlayGame");

		expect(component).toExist();
		expect(component.prop("gameName")).toBe(gameName);
		expect(component.prop("game")).toEqualImmutable(game);
	});

	it("should render a CreateGame component for the /game/create route", () => {
		const initialState = fromJS({
			users: {
				items: {},
			},
			games: {
				items: {},
			},
		});

		const wrapper = mount(
			<Provider
				store={createStore(initialState)}
			>
				<MemoryRouter
					initialEntries={[ `/game/create` ]}
				>
					<App
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find("CreateGame")).toExist();
	});

	it("should render a FindGame component for the /game/find route", () => {
		const initialState = fromJS({
			users: {
				items: {},
			},
			games: {
				items: {},
			},
		});

		const wrapper = mount(
			<Provider
				store={createStore(initialState)}
			>
				<MemoryRouter
					initialEntries={[ `/game/find` ]}
				>
					<App
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find("FindGame")).toExist();
	});

	it("should render a HowToPlay component for the /how-to-play route", () => {
		const initialState = fromJS({
			users: {
				items: {},
			},
			games: {
				items: {},
			},
		});

		const wrapper = mount(
			<Provider
				store={createStore(initialState)}
			>
				<MemoryRouter
					initialEntries={[ `/how-to-play` ]}
				>
					<App
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find("HowToPlay")).toExist();
	});

	it("should render a NotFoundPage component for an unmapped route", () => {
		const initialState = fromJS({
			users: {
				items: {},
			},
			games: {
				items: {},
			},
		});

		const wrapper = mount(
			<Provider
				store={createStore(initialState)}
			>
				<MemoryRouter
					initialEntries={[ `/this-is-not-a-real-route-dude` ]}
				>
					<App
					/>
				</MemoryRouter>
			</Provider>
		);

		expect(wrapper.find("NotFoundPage")).toExist();
	});
});
