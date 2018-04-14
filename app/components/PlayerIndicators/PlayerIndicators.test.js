import React from "react";
import { fromJS } from "immutable";
import { mount } from "enzyme";
import { wrapWithIntlProvider } from "@app/utils/test-utils";
import _PlayerIndicators from "./PlayerIndicators";
import Marble from "@app/components/Marble";

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
			playerLimit: 3,
		});

		const playerUsers = fromJS({
			1: {},
			2: {},
			3: {},
		});

		const wrapper = mount(
			<PlayerIndicators
				game={game}
				playerUsers={playerUsers}
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
			1: {},
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
});
