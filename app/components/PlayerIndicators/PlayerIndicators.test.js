import React from "react";
import { fromJS } from "immutable";
import PlayerIndicators from "./PlayerIndicators";
import Marble from "@app/components/Marble";
import { mount } from "enzyme";

describe("PlayerIndicators component", () => {
	it("should have a marble for each player", () => {
		const game = fromJS({
			players: [
				{
					color: "blue",
				},

				{
					color: "red",
				},

				{
					color: "green",
				},
			],
			playerLimit: 3,
		});

		const wrapper = mount(
			<PlayerIndicators
				game={game}
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
				},
			],
			playerLimit: 3,
		});

		const wrapper = mount(
			<PlayerIndicators
				game={game}
			/>
		);

		expect(wrapper.find(Marble)).toHaveLength(game.get("playerLimit"));
		expect(wrapper.find(Marble).at(0)).toHaveProp("color", "blue");
		expect(wrapper.find(Marble).at(1)).toHaveProp("color", null);
		// eslint-disable-next-line no-magic-numbers
		expect(wrapper.find(Marble).at(2)).toHaveProp("color", null);
	});
});
