import React from "react";
import { List, Map, fromJS } from "immutable";
import { mount } from "enzyme";
import * as immutableMatchers from "jest-immutable-matchers";

import createReducer from "@app/reducers";
import selectors from "@app/selectors";
import {
	fetchedGame,
	getUserGames,
} from "@app/actions";
import { mockStore, wrapWithProviders } from "@app/utils/test-utils";

import UserGamesList from "./UserGamesList";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("UserGamesList container", () => {
	it("should pass the correct props", () => {
		const reducer = createReducer();

		let state = reducer(undefined, {}).merge(
			{
				users: {
					items: {},
				},
			},
		);

		let store = mockStore(state);

		let wrapper = mount(
			wrapWithProviders(
				(
					<UserGamesList
					/>
				),
				{
					store,
				}
			)
		).find("UserGamesList");

		expect(wrapper).toHaveProp("userGames", List());
		expect(wrapper).toHaveProp("users", Map());
		expect(wrapper).toHaveProp("onGetUserGames", expect.any(Function));

		const user1 = fromJS({
			id: "1",
			name: {
				first: "Test",
				last: "One",
				display: "Test 1",
			},
		});

		const user2 = fromJS({
			id: "2",
			isMe: true,
			name: {
				first: "Test",
				last: "Two",
				display: "Test 2",
			},
		});

		const game1 = fromJS({
			name: "test1",
			board: {
				width: 10,
				height: 10,
				filledCells: [],
			},
			playerLimit: 3,
			players: [
				{
					color: "blue",
					user: user1,
				},
			],
		});

		const game2 = fromJS({
			name: "test2",
			board: {
				width: 10,
				height: 10,
				filledCells: [],
			},
			playerLimit: 3,
			players: [
				{
					color: "red",
					user: user2,
				},
				{
					color: "green",
					user: user1,
				},
			],
		});

		state = [
			fetchedGame({ game: game1 }),
			fetchedGame({ game: game2 }),
		].reduce(reducer, fromJS({
			users: {
				current: user2.get("id"),
			}
		}));

		store = mockStore(state);

		wrapper = mount(
			wrapWithProviders(
				(
					<UserGamesList
					/>
				),
				{
					store,
				}
			)
		).find("UserGamesList");

		const stateGame2 = selectors.games.getGame(state, { gameName: game2.get("name") });

		expect(wrapper.prop("userGames")).toEqualImmutable(List([ stateGame2 ]));
		expect(wrapper.prop("users")).toEqualImmutable(Map({
			[user1.get("id")]: user1,
			[user2.get("id")]: user2,
		}));
		expect(wrapper).toHaveProp("onGetUserGames", expect.any(Function));
	});

	it("should dispatch a getUserGames action", () => {
		const reducer = createReducer();

		const state = reducer(undefined, {}).merge(
			{
				users: {
					items: {},
				},
			},
		);

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = mount(
			wrapWithProviders(
				(
					<UserGamesList
					/>
				),
				{
					store,
				}
			)
		).find("UserGamesList");

		wrapper.prop("onGetUserGames")();

		expect(store.dispatch).toHaveBeenCalledWith(getUserGames());
	});
});
