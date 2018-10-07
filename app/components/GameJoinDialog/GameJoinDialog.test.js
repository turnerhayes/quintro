import React from "react";
import { shallow } from "enzyme";
import { fromJS } from "immutable";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import BoardRecord from "@shared-lib/board";

import Config from "@app/config";
import { intl } from "@app/utils/test-utils";
import ColorPicker from "@app/components/ColorPicker";

import { Unwrapped as GameJoinDialog } from "./GameJoinDialog";

const NO_OP = () => {};

function getColorPickerFromDialogWrapper(wrapper) {
	return wrapper.find(ColorPicker).shallow();
}

describe("GameJoinDialog component", () => {
	it("should not show claimed colors in the color picker", () => {
		const color1 = "blue";
		const color2 = "green";

		const game = fromJS({
			name: "testgame",
			board: new BoardRecord({
				width: 15,
				height: 15,
			}),
			players: [
				{
					color: color1,
				},
				{
					color: color2,
				},
			],
			playerLimit: 3,
		});

		const wrapper = shallow(
			<GameJoinDialog
				game={game}
				onSubmit={NO_OP}
				onCancel={NO_OP}
				classes={{}}
				intl={intl}
			/>
		);

		const colorPicker = getColorPickerFromDialogWrapper(wrapper).shallow();

		colorPicker.find(Button).filterWhere(
			(button) => button.key() === "color-change-button"
		).simulate("click", {});

		expect(colorPicker.find(Menu)).toExist();
		expect(colorPicker.find(MenuItem).filter(`[data-color='${color1}']`)).not.toExist();
		expect(colorPicker.find(MenuItem).filter(`[data-color='${color2}']`)).not.toExist();
		expect(colorPicker.find(MenuItem).filter("[data-color='red']")).toExist();
	});

	it("should remove a color from the list if it is taken while the dialog is open", () => {
		const game = fromJS({
			name: "testgame",
			board: new BoardRecord({
				width: 15,
				height: 15,
			}),
			players: [],
			playerLimit: 3,
		});

		const wrapper = shallow(
			<GameJoinDialog
				game={game}
				onSubmit={NO_OP}
				onCancel={NO_OP}
				classes={{}}
				intl={intl}
			/>
		);

		let colorPicker = getColorPickerFromDialogWrapper(wrapper).shallow();

		colorPicker.find(Button).filterWhere(
			(button) => button.key() === "color-change-button"
		).simulate("click", {});

		expect(colorPicker.find(MenuItem).filter(`[data-color='blue']`)).toExist();
		// Default color should start out selected
		expect(colorPicker.find(MenuItem).filter(`[data-color='blue']`)).toHaveProp("selected", true);

		const gameWithPlayer = game.setIn(
			[
				"players",
				0,
			],
			fromJS({
				color: "blue",
			})
		);

		wrapper.setProps({ game: gameWithPlayer });

		colorPicker = getColorPickerFromDialogWrapper(wrapper);

		colorPicker = colorPicker.shallow();

		expect(colorPicker.find(MenuItem).filter(`[data-color='blue']`)).not.toExist();
		// Former default color was taken; should have different default color
		expect(colorPicker.find(MenuItem).first()).toHaveProp("data-color", Config.game.colors[1].id);
		// Should automatically select the first non-taken color
		expect(colorPicker.find(MenuItem).first()).toHaveProp("selected", true);
	});

	it("should not show color picker if the game is full", () => {
		const game = fromJS({
			name: "testgame",
			board: new BoardRecord({
				width: 15,
				height: 15,
			}),
			players: [
				{
					color: "blue",
				},
				{
					color: "green",
				},
				{
					color: "red",
				},
			],
			playerLimit: 3,
		});

		const wrapper = shallow(
			<GameJoinDialog
				game={game}
				onSubmit={NO_OP}
				onCancel={NO_OP}
				classes={{}}
				intl={intl}
			/>
		);

		expect(
			wrapper.find(Button).filterWhere(
				(button) => button.key() === "color-change-button"
			)
		).not.toExist();
	});

	it("should allow user to watch game if the game is full", () => {
		const game = fromJS({
			name: "testgame",
			board: new BoardRecord({
				width: 15,
				height: 15,
			}),
			players: [
				{
					color: "blue",
				},
				{
					color: "green",
				},
				{
					color: "red",
				},
			],
			playerLimit: 3,
		});

		const wrapper = shallow(
			<GameJoinDialog
				game={game}
				onSubmit={NO_OP}
				onCancel={NO_OP}
				classes={{}}
				intl={intl}
			/>
		);

		expect(wrapper.find(Button).filter(".watch-game-button")).toExist();
	});

	it("should not show color picker if the game is started", () => {
		const game = fromJS({
			name: "testgame",
			board: new BoardRecord({
				width: 15,
				height: 15,
			}),
			players: [
				{
					color: "blue",
				},
				{
					color: "green",
				},
			],
			playerLimit: 3,
			isStarted: true,
		});

		const wrapper = shallow(
			<GameJoinDialog
				game={game}
				onSubmit={NO_OP}
				onCancel={NO_OP}
				classes={{}}
				intl={intl}
			/>
		);

		expect(
			wrapper.find(Button).filterWhere(
				(button) => button.key() === "color-change-button"
			)
		).not.toExist();
	});

	it("should allow user to watch game if the game is started", () => {
		const game = fromJS({
			name: "testgame",
			board: new BoardRecord({
				width: 15,
				height: 15,
			}),
			players: [
				{
					color: "blue",
				},
				{
					color: "green",
				},
			],
			playerLimit: 3,
			isStarted: true,
		});

		const wrapper = shallow(
			<GameJoinDialog
				game={game}
				onSubmit={NO_OP}
				onCancel={NO_OP}
				classes={{}}
				intl={intl}
			/>
		);

		expect(wrapper.find(Button).filter(".watch-game-button")).toExist();
	});

	it("should call the onWatchGame callback", () => {
		const game = fromJS({
			name: "testgame",
			board: new BoardRecord({
				width: 15,
				height: 15,
			}),
			players: [
				{
					color: "blue",
				},
				{
					color: "green",
				},
				{
					color: "red",
				},
			],
			playerLimit: 3,
			isStarted: true,
		});

		const onWatchGame = jest.fn();

		const wrapper = shallow(
			<GameJoinDialog
				game={game}
				onSubmit={NO_OP}
				onCancel={NO_OP}
				onWatchGame={onWatchGame}
				classes={{}}
				intl={intl}
			/>
		);

		wrapper.find(Button).filter(".watch-game-button").simulate("click", {});

		expect(onWatchGame).toHaveBeenCalledWith();
	});

	it("should call the onCancel callback", () => {
		const game = fromJS({
			name: "testgame",
			board: new BoardRecord({
				width: 15,
				height: 15,
				filledCells: [],
			}),
			players: [],
			playerLimit: 3,
		});

		const onCancel = jest.fn();

		const wrapper = shallow(
			<GameJoinDialog
				game={game}
				onSubmit={NO_OP}
				onCancel={onCancel}
				classes={{}}
				intl={intl}
			/>
		);

		wrapper.find(Button).filter(".cancel-button").simulate("click", {});

		expect(onCancel).toHaveBeenCalledWith();
	});

	it("should call the onSubmit callback with the default color if no color was selected", () => {
		const game = fromJS({
			name: "testgame",
			board: new BoardRecord({
				width: 15,
				height: 15,
			}),
			players: [],
			playerLimit: 3,
		});

		const onSubmit = jest.fn();

		const wrapper = shallow(
			<GameJoinDialog
				game={game}
				onSubmit={onSubmit}
				onCancel={NO_OP}
				classes={{}}
				intl={intl}
			/>
		);

		wrapper.find("form").simulate("submit", {
			preventDefault() {}
		});

		expect(onSubmit).toHaveBeenCalledWith({ color: "blue" });
	});

	it("should call the onSubmit callback with the selected color if a color was selected", () => {
		const game = fromJS({
			name: "testgame",
			board: new BoardRecord({
				width: 15,
				height: 15,
			}),
			players: [],
			playerLimit: 3,
		});

		const onSubmit = jest.fn();

		const wrapper = shallow(
			<GameJoinDialog
				game={game}
				onSubmit={onSubmit}
				onCancel={NO_OP}
				classes={{}}
				intl={intl}
			/>
		);

		const color = "yellow";

		wrapper.find(ColorPicker).prop("onColorChosen")({
			color,
		});

		wrapper.find("form").simulate("submit", {
			preventDefault() {},
		});

		expect(onSubmit).toHaveBeenCalledWith({ color });
	});
});
