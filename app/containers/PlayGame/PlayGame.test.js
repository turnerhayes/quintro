import React from "react";
import { fromJS, Set } from "immutable";
import { mount } from "enzyme";
import { goBack } from "connected-react-router";
import * as immutableMatchers from "jest-immutable-matchers";

import createReducer from "@app/reducers";
import selectors from "@app/selectors";
import {
	fetchedGame,
	addPlayers,
	getGame,
	watchGame,
	startGame,
	joinGame,
	placeMarble,
	setUIState,
} from "@app/actions";
import { mockStore, wrapWithProviders } from "@app/utils/test-utils";

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
		expect(wrapper.prop("currentUserPlayers")).toEqualImmutable(Set.of(player1));
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

		const player1 = {
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
		};

		const game = fromJS({
			name: gameName,
			board: {
				width: 10,
				height: 10,
				filledCells: [],
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
		});

		let state = [
			fetchedGame({ game }),
		].reduce(reducer, undefined);

		let store = mockStore(state);

		let wrapper = mount(
			wrapWithProviders(
				(
					<PlayGame
						gameName={gameName}
					/>
				),
				{
					store,
				}
			)
		).find("PlayGame");

		let player1State = selectors.games.getPlayers(state, {
			gameName
		}).first();

		propExpectations({
			player1: player1State,
			gameName,
			wrapper,
			state,
		});

		const joinedGameState = [
			addPlayers({
				gameName,
				players: [
					Object.assign({ order: 0 }, player1)
				],
			}),
		].reduce(reducer, state);

		store = mockStore(joinedGameState);

		wrapper = mount(
			wrapWithProviders(
				(
					<PlayGame
						gameName={gameName}
					/>
				),
				{
					store,
				}
			)
		).find("PlayGame");
		
		player1State = selectors.games.getPlayers(state, {
			gameName
		}).first();

		propExpectations({
			gameName,
			player1: player1State,
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
			wrapWithProviders(
				(
					<PlayGame
						gameName={gameName}
					/>
				),
				{
					store,
				}
			)
		);

		expect(store.dispatch).toHaveBeenCalledWith(getGame({ gameName }));
	});

	it("should dispatch a watchGame action", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = mount(
			wrapWithProviders(
				(
					<PlayGame
						gameName={gameName}
					/>
				),
				{
					store,
				}
			)
		).find("PlayGame");

		wrapper.prop("onWatchGame")();

		expect(store.dispatch).toHaveBeenCalledWith(watchGame({ gameName }));
	});

	it("should dispatch a startGame action", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = mount(
			wrapWithProviders(
				(
					<PlayGame
						gameName={gameName}
					/>
				),
				{
					store,
				}
			)
		).find("PlayGame");

		wrapper.prop("onStartGame")();

		expect(store.dispatch).toHaveBeenCalledWith(startGame({ gameName }));
	});

	it("should dispatch a joinGame action", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = mount(
			wrapWithProviders(
				(
					<PlayGame
						gameName={gameName}
					/>
				),
				{
					store,
				}
			)
		).find("PlayGame");

		wrapper.prop("onJoinGame")({});

		expect(store.dispatch).toHaveBeenCalledWith(joinGame({ gameName }));

		const colors = ["blue", "red"];

		wrapper.prop("onJoinGame")({ colors });

		expect(store.dispatch).toHaveBeenCalledWith(joinGame({ gameName, colors }));
	});

	it("should dispatch a placeMarble action", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = mount(
			wrapWithProviders(
				(
					<PlayGame
						gameName={gameName}
					/>
				),
				{
					store,
				}
			)
		).find("PlayGame");

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

		const wrapper = mount(
			wrapWithProviders(
				(
					<PlayGame
						gameName={gameName}
					/>
				),
				{
					store,
				}
			)
		).find("PlayGame");

		wrapper.prop("onCancelJoin")();

		expect(store.dispatch).toHaveBeenCalledWith(goBack());
	});

	it("should dispatch a setUIState action to change the zoom level", () => {
		const reducer = createReducer();

		const gameName = "test";

		const state = reducer(undefined, {});

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = mount(
			wrapWithProviders(
				(
					<PlayGame
						gameName={gameName}
					/>
				),
				{
					store,
				}
			)
		).find("PlayGame");

		// eslint-disable-next-line no-magic-numbers
		wrapper.prop("onZoomLevelChange")(1.4);

		expect(store.dispatch).toHaveBeenCalledWith(setUIState({
			section: "PlayGame",
			settings: {
				currentZoomLevel: 1.4,
			},
		}));
	});
});
