import React from "react";
import { fromJS } from "immutable";
import { shallow, mount } from "enzyme";
import { intlShape } from "react-intl";
import { goBack } from "react-router-redux";
import * as immutableMatchers from "jest-immutable-matchers";

import createReducer from "@app/reducers";
import selectors from "@app/selectors";
import {
	fetchedGame,
	addPlayer,
	getGame,
	watchGame,
	startGame,
	joinGame,
	placeMarble,
} from "@app/actions";
import { mockStore, intl } from "@app/utils/test-utils";

import PlayGame from "./PlayGame";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("PlayGame container", () => {
	function propExpectations({
		wrapper,
		state,
		gameName,
		player1,
		isInGame = true,
		isWatchingGame = false,
		hasJoinedGame = false,
		watcherCount = 0,
	}) {
		const dispatchFunctions = [
			"onGetGame",
			"onWatchGame",
			"onStartGame",
			"onJoinGame",
			"onPlaceMarble",
			"onCancelJoin",
		];

		expect(wrapper.prop("game")).toEqualImmutable(
			selectors.games.getGame(state, { gameName })
		);
		expect(wrapper.prop("playerUsers")).toEqualImmutable(
			selectors.games.getPlayerUsers(state, { gameName })
		);
		expect(wrapper).toHaveProp("currentUserPlayerColor", player1.get("color"));
		expect(wrapper).toHaveProp("isInGame", isInGame);
		expect(wrapper).toHaveProp("isWatchingGame", isWatchingGame);
		expect(wrapper).toHaveProp("hasJoinedGame", hasJoinedGame);
		expect(wrapper).toHaveProp("watcherCount", watcherCount);

		dispatchFunctions.forEach(
			(func) => expect(wrapper).toHaveProp(func, expect.any(Function))
		);
	}

	it("should pass the correct props", () => {
		const reducer = createReducer();

		const gameName = "test";

		const player1Color = "blue";
		const player2Color = "red";

		const player1 = fromJS(
			{
				color: player1Color,
				user: {
					id: "1",
					name: {
						first: "Test",
						last: "One",
						display: "Test One",
					},
					isMe: true,
				},
			}
		);

		const game = fromJS({
			name: gameName,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [
				player1,
				{
					color: player2Color,
					user: {
						id: "2",
						name: {
							first: "Test",
							last: "Two",
							display: "Test Two",
						},
					},
				},
			],
			isStarted: true,
			currentPlayerColor: player2Color,
		});

		let state = [
			fetchedGame({ game }),
		].reduce(reducer, undefined);

		let store = mockStore(state);

		let wrapper = shallow(
			(
				<PlayGame
					gameName={gameName}
				/>
			),
			{
				context: {
					store,
				},
			},
		);

		propExpectations({
			player1,
			gameName,
			wrapper,
			state,
		});

		const joinedGameState = [
			addPlayer({ gameName, player: player1.set("order", 0) }),
		].reduce(reducer, state);

		store = mockStore(joinedGameState);

		wrapper = shallow(
			(
				<PlayGame
					gameName={gameName}
				/>
			),
			{
				context: {
					store,
				},
			},
		);

		propExpectations({
			gameName,
			player1,
			wrapper,
			state: joinedGameState,
			hasJoinedGame: true,
		});
	});

	it("should dispatch a getGame action", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		// Need to mount this so that the actual component gets rendered and
		// runs its lifecycle callbacks
		mount(
			(
				<PlayGame
					gameName={gameName}
				/>
			),
			{
				context: {
					store,
					intl,
				},
				childContextTypes: {
					intl: intlShape,
				},
			},
		);

		expect(store.dispatch).toHaveBeenCalledWith(getGame({ name: gameName }));
	});

	it("should dispatch a watchGame action", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = shallow(
			(
				<PlayGame
					gameName={gameName}
				/>
			),
			{
				context: {
					store,
					intl,
				},
				childContextTypes: {
					intl: intlShape,
				},
			},
		);

		wrapper.prop("onWatchGame")();

		expect(store.dispatch).toHaveBeenCalledWith(watchGame({ gameName }));
	});

	it("should dispatch a startGame action", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = shallow(
			(
				<PlayGame
					gameName={gameName}
				/>
			),
			{
				context: {
					store,
					intl,
				},
				childContextTypes: {
					intl: intlShape,
				},
			},
		);

		wrapper.prop("onStartGame")();

		expect(store.dispatch).toHaveBeenCalledWith(startGame({ gameName }));
	});

	it("should dispatch a joinGame action", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = shallow(
			(
				<PlayGame
					gameName={gameName}
				/>
			),
			{
				context: {
					store,
					intl,
				},
				childContextTypes: {
					intl: intlShape,
				},
			},
		);

		wrapper.prop("onJoinGame")({});

		expect(store.dispatch).toHaveBeenCalledWith(joinGame({ gameName }));

		const color = "blue";

		wrapper.prop("onJoinGame")({ color });

		expect(store.dispatch).toHaveBeenCalledWith(joinGame({ gameName, color }));
	});

	it("should dispatch a placeMarble action", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = shallow(
			(
				<PlayGame
					gameName={gameName}
				/>
			),
			{
				context: {
					store,
					intl,
				},
				childContextTypes: {
					intl: intlShape,
				},
			},
		);

		// eslint-disable-next-line no-magic-numbers
		const position = fromJS([ 1, 2 ]);

		wrapper.prop("onPlaceMarble")({
			gameName,
			position,
		});

		expect(store.dispatch).toHaveBeenCalledWith(placeMarble({
			gameName,
			position,
		}));
	});

	it("should dispatch a goBack action", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = shallow(
			(
				<PlayGame
					gameName={gameName}
				/>
			),
			{
				context: {
					store,
					intl,
				},
				childContextTypes: {
					intl: intlShape,
				},
			},
		);

		wrapper.prop("onCancelJoin")();

		expect(store.dispatch).toHaveBeenCalledWith(goBack());
	});
});
