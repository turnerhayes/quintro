import React from "react";
import { fromJS } from "immutable";
import { shallow } from "enzyme";
import { intlShape } from "react-intl";
import IconButton from "@material-ui/core/IconButton";

import BoardRecord from "@shared-lib/board";

import ColorPicker from "@app/components/ColorPicker";
import { intl } from "@app/utils/test-utils";

import AddPlayerButton from "./AddPlayerButton";

describe("AddPlayerButton component", () => {
	it("should set state when the color is changed", () => {
		const game = fromJS({
			name: "test",
			board: new BoardRecord({
				width: 10,
				height: 10,
			}),
			playerLimit: 3,
			players: [],
		});

		const wrapper = shallow(
			(
				<AddPlayerButton
					game={game}
					onAdd={() => {}}
				/>
			),
			{
				context: {
					intl,
				},

				childContextTypes: {
					intl: intlShape,
				},
			}
		).dive().dive();
		
		
		expect(wrapper).toHaveState("color", "blue");
		
		wrapper.shallow().find(ColorPicker)
			.prop("onColorChosen")({
				color: "red",
			});
		
		expect(wrapper).toHaveState("color", "red");
	});

	it("should call the onSubmit handler with the selected color", () => {
		const onAdd = jest.fn().mockName("mock_onAdd");

		const game = fromJS({
			name: "test",
			board: new BoardRecord({
				width: 10,
				height: 10,
			}),
			playerLimit: 3,
			players: [],
		});

		const wrapper = shallow(
			(
				<AddPlayerButton
					game={game}
					onAdd={onAdd}
				/>
			),
			{
				context: {
					intl,
				},

				childContextTypes: {
					intl: intlShape,
				},
			}
		).dive().dive();
		
		wrapper.shallow().find(ColorPicker)
			.prop("onColorChosen")({
				color: "red",
			});
		
		wrapper.shallow().find(IconButton).simulate("click");
		
		expect(onAdd).toHaveBeenCalledWith({
			color: "red",
		});
	});
});
