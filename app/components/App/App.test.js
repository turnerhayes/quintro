import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import fetchMock from "fetch-mock";
import Loadable from "react-loadable";
import * as immutableMatchers from "jest-immutable-matchers";

import BoardRecord from "@shared-lib/board";

import { mockStore, wrapWithProviders } from "@app/utils/test-utils";

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
			wrapWithProviders(
				(
					<App
					/>
				),
				{
					store: mockStore(initialState),
					initialEntries: [ "/" ],
				}
			)
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
			wrapWithProviders(
				(
					<App
					/>
				),
				{
					store: mockStore(initialState),
					initialEntries: [ "/" ],
				}
			)
		);

		expect(wrapper.find(".page-layout__left-panel").find("UserGamesList")).toExist();
	});

	it("should render a PlayGame component for the /play/:game route", () => {
		const gameName = "testgame";

		const game = fromJS({
			name: gameName,
			board: new BoardRecord({
				width: 10,
				height: 10,
				filledCells: [],
			}),
			players: [],
			playerLimit: 3,
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
			wrapWithProviders(
				(
					<App
					/>
				),
				{
					store: mockStore(initialState),
					initialEntries: [ `/play/${gameName}` ],
				}
			)
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
			wrapWithProviders(
				(
					<App
					/>
				),
				{
					store: mockStore(initialState),
					initialEntries: [ "/game/create" ],
				}
			)
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
			wrapWithProviders(
				(
					<App
					/>
				),
				{
					store: mockStore(initialState),
					initialEntries: [ "/game/find" ],
				}
			)
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
			wrapWithProviders(
				(
					<App
					/>
				),
				{
					store: mockStore(initialState),
					initialEntries: [ "/how-to-play" ],
				}
			)
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
			wrapWithProviders(
				(
					<App
					/>
				),
				{
					store: mockStore(initialState),
					initialEntries: [ "/this-is-not-a-real-route-dude" ],
				}
			)
		);

		expect(wrapper.find("NotFoundPage")).toExist();
	});
});
