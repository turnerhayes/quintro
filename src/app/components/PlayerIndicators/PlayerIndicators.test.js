import React from "react";
import { fromJS } from "immutable";
import { shallow } from "enzyme";

import { intl } from "@app/utils/test-utils";
import { Unwrapped as PlayerIndicators } from "./PlayerIndicators";
import Marble from "@app/components/Marble";


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

		const wrapper = shallow(
			<PlayerIndicators
				game={game}
				playerUsers={playerUsers}
				markActive
				classes={{}}
				intl={intl}
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

		const wrapper = shallow(
			<PlayerIndicators
				game={game}
				playerUsers={playerUsers}
				classes={{}}
				intl={intl}
			/>
		);

		expect(wrapper.find(Marble)).toHaveLength(game.get("playerLimit"));
		expect(wrapper.find(Marble).at(0)).toHaveProp("color", "blue");
		expect(wrapper.find(Marble).at(1)).toHaveProp("color", null);
		// eslint-disable-next-line no-magic-numbers
		expect(wrapper.find(Marble).at(2)).toHaveProp("color", null);
	});

	it("should invoke the onIndicatorClick callback when a filled player indicator is clicked", () => {
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

		const onIndicatorClick = jest.fn();

		const classes = {
			item: "item-class",
		};

		const wrapper = shallow(
			<PlayerIndicators
				game={game}
				playerUsers={playerUsers}
				onIndicatorClick={onIndicatorClick}
				classes={classes}
				intl={intl}
			/>
		);

		wrapper.find(`.${classes.item}`).first().simulate("click", {});

		expect(onIndicatorClick).toHaveBeenCalledWith({
			selectedPlayer: player,
			element: undefined,
			index: 0,
		});
	});

	it("should invoke the onIndicatorClick callback when an empty player indicator is clicked", () => {
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

		const onIndicatorClick = jest.fn();

		const classes = {
			item: "item-class",
		};

		const wrapper = shallow(
			<PlayerIndicators
				game={game}
				playerUsers={playerUsers}
				onIndicatorClick={onIndicatorClick}
				classes={classes}
				intl={intl}
			/>
		);

		wrapper.find(`.${classes.item}`).at(1).simulate("click", {});

		expect(onIndicatorClick).toHaveBeenCalledWith({
			selectedPlayer: null,
			element: undefined,
			index: 1,
		});
	});

	it("should accept a function for definining indicator props", () => {
		const gameName = "testgame";

		const player = fromJS({
			color: "blue",
			userID: "1",
		});

		const game = fromJS({
			name: gameName,
			players: [
				player,
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
		
		const classes = {
			item: "item-class",
		};

		const propArgs = {
			player,
			user: playerUsers.get("1"),
			index: 0,
			active: false,
			isPresent: false,
		};

		const wrapper = shallow(
			<PlayerIndicators
				game={game}
				playerUsers={playerUsers}
				classes={classes}
				intl={intl}
				indicatorProps={(args) => {
					return {
						"data-indicator-props": JSON.stringify(args),
					};
				}}
			/>
		);

		expect(wrapper.find(`.${classes.item}`).first()).toHaveProp("data-indicator-props", JSON.stringify(propArgs));
	});
});
