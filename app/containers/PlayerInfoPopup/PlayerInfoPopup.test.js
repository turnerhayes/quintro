import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import * as immutableMatchers from "jest-immutable-matchers";

import createReducer from "@app/reducers";
import selectors from "@app/selectors";
import {
	changeUserProfile,
} from "@app/actions";
import {
	fetchedGame,
} from "@app/actions";
import { mockStore, wrapWithProviders } from "@app/utils/test-utils";

import PlayerInfoPopup from "./PlayerInfoPopup";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("PlayerInfoPopup container", () => {
	it("should pass the correct props", () => {
		const reducer = createReducer();

		const player = fromJS({
			userID: "1",
			color: "blue",
		});

		const user = fromJS({
			id: "1",
			name: "Test Testerson",
		});

		const game = fromJS({
			name: "test",
			board: {
				width: 10,
				height: 10,
				filledCells: [],
			},
			players: [
				{
					user,
					color: player.get("color"),
				}
			],
		});

		const state = [
			fetchedGame({ game }),
		].reduce(reducer, undefined);

		const store = mockStore(state);

		const wrapper = mount(
			wrapWithProviders(
				(
					<PlayerInfoPopup
						player={player}
						game={selectors.games.getGame(state, { gameName: game.get("name") })}
					/>
				),
				{
					store,
				}
			)
		).find("PlayerInfoPopup");

		expect(wrapper.prop("playerUser")).toEqualImmutable(user);
		expect(wrapper.prop("onDisplayNameChange")).toEqual(expect.any(Function));
	});

	it("should dispatch a changeUserProfile action on display name change", () => {
		const reducer = createReducer();

		const player = fromJS({
			userID: "1",
			color: "blue",
		});

		const user = fromJS({
			id: "1",
			name: "Test Testerson",
		});

		const game = fromJS({
			name: "test",
			board: {
				width: 10,
				height: 10,
				filledCells: [],
			},
			players: [
				{
					user,
					color: player.get("color"),
				}
			],
		});

		const state = [
			fetchedGame({ game }),
		].reduce(reducer, undefined);

		const store = mockStore(state);

		jest.spyOn(store, "dispatch");

		const wrapper = mount(
			wrapWithProviders(
				(
					<PlayerInfoPopup
						player={player}
						game={selectors.games.getGame(state, { gameName: game.get("name") })}
					/>
				),
				{
					store,
				}
			)
		).find("PlayerInfoPopup");

		const displayName = "Test Guy";

		wrapper.prop("onDisplayNameChange")({
			player,
			displayName,
		});

		expect(store.dispatch).toHaveBeenCalledWith(changeUserProfile({
			userID: player.get("userID"),
			updates: {
				displayName,
			},
		}));
	});
});
