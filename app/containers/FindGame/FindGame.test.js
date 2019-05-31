import React from "react";
import { mount } from "enzyme";
import { fromJS } from "immutable";
import { push } from "connected-react-router";
import * as immutableMatchers from "jest-immutable-matchers";

import createReducer from "@app/reducers";
import { mockStore, wrapWithProviders } from "@app/utils/test-utils";
import {
	findOpenGames,
	setFindOpenGamesResults,
} from "@app/actions";

import FindGame from "./FindGame";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("FindGame container", () => {
	it("should pass the correct props", () => {
		const reducer = createReducer();

		const results = fromJS([
			{
				name: "test1",
				board: {
					width: 15,
					height: 15,
					filledCells: [],
				},
				players: [],
				isStarted: false,
			},
			{
				name: "test2",
				board: {
					width: 15,
					height: 15,
					filledCells: [],
				},
				players: [],
				isStarted: false,
			},
		]);

		const state = reducer(undefined, setFindOpenGamesResults({
			games: results,
		}));

		let store = mockStore(state);

		let wrapper = mount(
			wrapWithProviders(
				(
					<FindGame
					/>
				),
				{
					store,
				}
			)
		).find("FindGame");

		expect(wrapper.prop("results")).toEqualImmutable(results);
		expect(wrapper).toHaveProp("findGameError", undefined);
		expect(wrapper).toHaveProp("onJoinGame", expect.any(Function));
		expect(wrapper).toHaveProp("onFindOpenGames", expect.any(Function));

		const error = new Error("Test findGameError");

		store = mockStore(state.setIn(
			[
				"games",
				"findGameError",
			],
			error
		).deleteIn(
			[
				"games",
				"openGames",
			]
		));

		wrapper = mount(
			wrapWithProviders(
				(
					<FindGame
					/>
				),
				{
					store,
				}
			)
		).find("FindGame");

		expect(wrapper).toHaveProp("results", undefined);
		expect(wrapper).toHaveProp("findGameError", error);
		expect(wrapper).toHaveProp("onJoinGame", expect.any(Function));
		expect(wrapper).toHaveProp("onFindOpenGames", expect.any(Function));

		store = mockStore(reducer(undefined, {}));

		wrapper = mount(
			wrapWithProviders(
				(
					<FindGame
					/>
				),
				{
					store,
				}
			)
		).find("FindGame");

		expect(wrapper).toHaveProp("results", undefined);
		expect(wrapper).toHaveProp("findGameError", undefined);
		expect(wrapper).toHaveProp("onJoinGame", expect.any(Function));
		expect(wrapper).toHaveProp("onFindOpenGames", expect.any(Function));
	});

	it("should dispatch a findOpenGames action", () => {
		const reducer = createReducer();

		const store = mockStore(reducer(undefined, {}));

		jest.spyOn(store, "dispatch");

		let wrapper = mount(
			wrapWithProviders(
				(
					<FindGame
					/>
				),
				{
					store,
				}
			)
		).find("FindGame");

		wrapper.prop("onFindOpenGames")({
			numberOfPlayers: undefined,
		});

		expect(store.dispatch).toHaveBeenCalledWith(findOpenGames({
			numberOfPlayers: undefined,
		}));

		const numberOfPlayers = 3;

		store.dispatch.mockReset();

		wrapper.prop("onFindOpenGames")({
			numberOfPlayers,
		});

		expect(store.dispatch).toHaveBeenCalledWith(findOpenGames({
			numberOfPlayers,
		}));
	});

	it("should dispatch a push action when a game is joined", () => {
		const reducer = createReducer();

		const store = mockStore(reducer(undefined, {}));

		jest.spyOn(store, "dispatch");

		const wrapper = mount(
			wrapWithProviders(
				(
					<FindGame
					/>
				),
				{
					store,
				}
			)
		).find("FindGame");

		const gameName = "test";

		wrapper.prop("onJoinGame")({ gameName });

		expect(store.dispatch).toHaveBeenCalledWith(push(`/play/${gameName}`));
	});
});
