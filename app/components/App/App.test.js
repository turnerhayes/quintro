import React from "react";
import PropTypes from "prop-types";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { intlShape } from "react-intl";
import fetchMock from "fetch-mock";
import Loadable from "react-loadable";
import * as immutableMatchers from "jest-immutable-matchers";
import { intl, mockStore } from "@app/utils/test-utils";
import App from "./index";


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
			(
				<MemoryRouter
					initialEntries={[ "/" ]}
				>
					<App
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store: mockStore(initialState),
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
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
			(
				<MemoryRouter
					initialEntries={[ "/" ]}
				>
					<App
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store: mockStore(initialState),
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
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
			(
				<MemoryRouter
					initialEntries={[ `/play/${gameName}` ]}
				>
					<App
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store: mockStore(initialState),
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
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
			(
				<MemoryRouter
					initialEntries={[ "/game/create" ]}
				>
					<App
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store: mockStore(initialState),
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
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
			(
				<MemoryRouter
					initialEntries={[ "/game/find" ]}
				>
					<App
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store: mockStore(initialState),
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
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
			(
				<MemoryRouter
					initialEntries={[ "/how-to-play" ]}
				>
					<App
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store: mockStore(initialState),
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
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
			(
				<MemoryRouter
					initialEntries={[ "/this-is-not-a-real-route-dude" ]}
				>
					<App
					/>
				</MemoryRouter>
			),
			{
				context: {
					intl,
					store: mockStore(initialState),
				},

				childContextTypes: {
					intl: intlShape,
					store: PropTypes.object,
				},
			}
		);

		expect(wrapper.find("NotFoundPage")).toExist();
	});
});
