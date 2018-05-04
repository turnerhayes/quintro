import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router";

import { wrapWithIntlProvider } from "@app/utils/test-utils";
import _PlayerIndicators from "./index";
import Marble from "@app/components/Marble";

const mockStore = configureStore();

const PlayerIndicators = wrapWithIntlProvider(_PlayerIndicators);

describe("PlayerIndicators component", () => {
	it("should have a marble for each player", () => {
		const game = fromJS({
			players: [
				{
					color: "blue",
					userID: "1",
				},

				{
					color: "red",
					userID: "2",
				},

				{
					color: "green",
					userID: "3",
				},
			],
			currentPlayerColor: "blue",
			playerLimit: 3,
			playerPresence: {
				red: true,
			},
		});

		const playerUsers = fromJS({
			1: {
				id: "1",
				isMe: true,
			},
			2: {
				id: "2",
			},
			3: {
				id: "3",
			},
		});

		const wrapper = mount(
			<PlayerIndicators
				game={game}
				playerUsers={playerUsers}
				markActive
			/>
		);

		expect(wrapper.find(Marble)).toHaveLength(game.get("players").size);
		expect(wrapper.find(Marble).at(0)).toHaveProp("color", "blue");
		expect(wrapper.find(Marble).at(1)).toHaveProp("color", "red");
		// eslint-disable-next-line no-magic-numbers
		expect(wrapper.find(Marble).at(2)).toHaveProp("color", "green");
	});

	it("should have empty marbles at the end for unfilled player slots", () => {
		const game = fromJS({
			players: [
				{
					color: "blue",
					userID: "1",
				},
			],
			playerLimit: 3,
		});

		const playerUsers = fromJS({
			1: {
				id: "1",
			},
		});

		const wrapper = mount(
			<PlayerIndicators
				game={game}
				playerUsers={playerUsers}
			/>
		);

		expect(wrapper.find(Marble)).toHaveLength(game.get("playerLimit"));
		expect(wrapper.find(Marble).at(0)).toHaveProp("color", "blue");
		expect(wrapper.find(Marble).at(1)).toHaveProp("color", null);
		// eslint-disable-next-line no-magic-numbers
		expect(wrapper.find(Marble).at(2)).toHaveProp("color", null);
	});

	it("should show a user information popover on clicking an indicator", () => {
		const gameName = "testgame";

		const game = fromJS({
			name: gameName,
			players: [
				{
					color: "blue",
					userID: "1",
				},
			],
			playerLimit: 3,
		});

		const playerUsers = fromJS({
			1: {
				id: "1",
				name: {
					display: "Test",
				},
			},
		});

		const state = fromJS({
			games: {
				items: {
					[gameName]: game,
				},
			},
			users: {
				items: playerUsers,
			},
		});

		const store = mockStore(state);

		const wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<PlayerIndicators
						game={game}
						playerUsers={playerUsers}
					/>
				</MemoryRouter>
			</Provider>
		);

		const classes = wrapper.find("PlayerIndicators").prop("classes");

		wrapper.find(`.${classes.item}`).first().simulate("click");

		expect(wrapper.find("Popover")).toHaveProp("open", true);
	});

	it("should invoke the onIndicatorClicked callback when a player indicator is clicked", () => {
		const gameName = "testgame";
		const userID = "1";

		const player = fromJS({
			color: "blue",
			userID,
		});

		const game = fromJS({
			name: gameName,
			players: [
				player,
			],
			playerLimit: 3,
		});

		const playerUsers = fromJS({
			[userID]: {
				id: userID,
				name: {
					display: "Test",
				},
			},
		});

		const state = fromJS({
			games: {
				items: {
					[gameName]: game,
				},
			},
			users: {
				items: playerUsers,
			},
		});

		const store = mockStore(state);

		const onIndicatorClicked = jest.fn();

		const wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<PlayerIndicators
						game={game}
						playerUsers={playerUsers}
						onIndicatorClicked={onIndicatorClicked}
					/>
				</MemoryRouter>
			</Provider>
		);

		const classes = wrapper.find("PlayerIndicators").prop("classes");

		wrapper.find(`.${classes.item}`).first().simulate("click");

		expect(onIndicatorClicked).toHaveBeenCalledWith({ selectedPlayer: player });
	});

	it("should update state correctly when popover is opened and closed", () => {
		const gameName = "testgame";
		const userID = "1";
		const color = "blue";

		const player = fromJS({
			color,
			userID,
		});

		const game = fromJS({
			name: gameName,
			players: [
				player,
			],
			playerLimit: 3,
		});

		const playerUsers = fromJS({
			[userID]: {
				id: userID,
				name: {
					display: "Test",
				},
			},
		});

		const state = fromJS({
			games: {
				items: {
					[gameName]: game,
				},
			},
			users: {
				items: playerUsers,
			},
		});

		const store = mockStore(state);

		const wrapper = mount(
			<Provider
				store={store}
			>
				<MemoryRouter>
					<PlayerIndicators
						game={game}
						playerUsers={playerUsers}
					/>
				</MemoryRouter>
			</Provider>
		);

		const classes = wrapper.find("PlayerIndicators").prop("classes");

		wrapper.find(`.${classes.item}`).first().simulate("click");

		expect(wrapper.find("PlayerIndicators").instance().state)
			.toHaveProperty("selectedPlayerColor", color);

		wrapper.find("Popover").prop("onClose")();

		expect(wrapper.find("PlayerIndicators").instance().state)
			.toHaveProperty("selectedPlayerColor", null);
	});
});
