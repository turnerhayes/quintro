import React from "react";
import { shallow } from "enzyme";
import IconButton from "@material-ui/core/IconButton";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ZoomInIcon from "@material-ui/icons/ZoomIn";

import { Unwrapped as ZoomControls } from "./ZoomControls";

describe("ZoomControls component", () => {
	it("should set current zoom level from the input", () => {
		const onZoomLevelChange = jest.fn()
			.mockName("mock-onZoomLevelChange");

		const wrapper = shallow(
			<ZoomControls
				onZoomLevelChange={onZoomLevelChange}
				classes={{}}
			/>
		);

		const zoomLevel = 2.3;

		wrapper.find("TextField").simulate("change", { target: { valueAsNumber: zoomLevel }});

		expect(onZoomLevelChange).toHaveBeenCalledWith(zoomLevel);
	});

	it("should increment zoom level on pressing the (+) zoom button", () => {
		const onZoomLevelChange = jest.fn()
			.mockName("mock-onZoomLevelChange");

		const expectedZoomLevel = 1.1;

		const wrapper = shallow(
			<ZoomControls
				onZoomLevelChange={onZoomLevelChange}
				classes={{}}
			/>
		);

		wrapper.find(IconButton).filterWhere(
			(button) => button.find(ZoomInIcon).exists()
		).simulate("click");

		expect(onZoomLevelChange).toHaveBeenCalledWith(expectedZoomLevel);
	});

	it("should decrement zoom level on pressing the (-) zoom button", () => {
		const onZoomLevelChange = jest.fn()
			.mockName("mock-onZoomLevelChange");

		const expectedZoomLevel = 0.9;

		const wrapper = shallow(
			<ZoomControls
				onZoomLevelChange={onZoomLevelChange}
				classes={{}}
			/>
		);

		wrapper.find(IconButton).filterWhere(
			(button) => button.find(ZoomOutIcon).exists()
		).simulate("click");

		expect(onZoomLevelChange).toHaveBeenCalledWith(expectedZoomLevel);
	});

	it("should cap zoom at max zoom level", () => {
		const onZoomLevelChange = jest.fn()
			.mockName("mock-onZoomLevelChange");

		const maxZoomLevel = 4;

		const tooBigZoomLevel = 5;

		const wrapper = shallow(
			<ZoomControls
				maxZoomLevel={maxZoomLevel}
				onZoomLevelChange={onZoomLevelChange}
				classes={{}}
			/>
		);

		wrapper.find("TextField").simulate(
			"change",
			{
				target: {
					valueAsNumber: tooBigZoomLevel,
				},
			}
		);

		expect(onZoomLevelChange).toHaveBeenCalledWith(maxZoomLevel);
	});

	it("should cap zoom at min zoom level", () => {
		const onZoomLevelChange = jest.fn()
			.mockName("mock-onZoomLevelChange");

		const minZoomLevel = 0.5;

		const tooSmallZoomLevel = 0.3;

		const wrapper = shallow(
			<ZoomControls
				minZoomLevel={minZoomLevel}
				onZoomLevelChange={onZoomLevelChange}
				classes={{}}
			/>
		);

		wrapper.find("TextField").simulate(
			"change",
			{
				target: {
					valueAsNumber: tooSmallZoomLevel,
				},
			}
		);

		expect(onZoomLevelChange).toHaveBeenCalledWith(minZoomLevel);
	});

	it("should not trigger the callback if the zoom level did not change", () => {
		const onZoomLevelChange = jest.fn()
			.mockName("mock-onZoomLevelChange");

		const maxZoomLevel = 4;

		const wrapper = shallow(
			<ZoomControls
				maxZoomLevel={maxZoomLevel}
				onZoomLevelChange={onZoomLevelChange}
				classes={{}}
			/>
		);

		wrapper.find(IconButton).filterWhere(
			(button) => button.find(ZoomInIcon).exists()
		).simulate("click");

		expect(onZoomLevelChange).not.toHaveBeenCalledWith();
	});
});

