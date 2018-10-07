import React from "react";
import { shallow } from "enzyme";
import { fromJS } from "immutable";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import BoardRecord from "@shared-lib/board";

import Config from "@app/config";

import ColorPicker from "./ColorPicker";

describe("ColorPicker component", () => {
	it("should call the onColorChosen callback when a color is chosen", () => {
		const color = "green";
		const onColorChosen = jest.fn().mockName("mock_onColorSelected");
		
		const wrapper = shallow(
			<ColorPicker
				onColorChosen={onColorChosen}
			/>
		).shallow();

		wrapper.find(Button).filterWhere(
			(button) => button.key() === "color-change-button"
		).simulate("click", {});

		wrapper.find(MenuItem).filter(`[data-color='${color}']`).simulate("click", {});

		expect(wrapper.find(Menu)).toHaveProp("open", false);
		
		expect(onColorChosen).toHaveBeenCalledWith({ color });
	});

	describe("getDefaultColorForGame", () => {
		it("should return the first color if there are no players", () => {
			const game = fromJS({
				name: "test",
				board: new BoardRecord({
					width: 10,
					height: 10,
				}),
				playerLimit: 6,
				players: [],
			});

			expect(ColorPicker.getDefaultColorForGame({ game })).toBe("blue");
		});

		it("should return the first unused color", () => {
			const game = fromJS({
				name: "test",
				board: new BoardRecord({
					width: 10,
					height: 10,
				}),
				playerLimit: 6,
				players: [
					{
						color: "blue",
						user: {
							id: "1",
						}
					},
				],
			});

			expect(ColorPicker.getDefaultColorForGame({ game })).toBe("red");
		});

		it("should return undefined if there are no more colors available", () => {
			const game = fromJS({
				name: "test",
				board: new BoardRecord({
					width: 10,
					height: 10,
				}),
				playerLimit: 6,
				players: Config.game.colors.map(
					(color, index) => ({
						color: color.id,
						user: {
							id: index,
						},
					})
				),
			});

			expect(ColorPicker.getDefaultColorForGame({ game })).toBeUndefined();
		});
	});
});
