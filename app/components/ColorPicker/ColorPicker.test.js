import React from "react";
import { shallow } from "enzyme";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

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
});
