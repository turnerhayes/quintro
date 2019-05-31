import React from "react";
import { shallow } from "enzyme";
import TextField from "@material-ui/core/TextField";
import ToggleButton from "@material-ui/lab/ToggleButton";

import { intl } from "@app/utils/test-utils";

import { Unwrapped as DimensionInput } from "./DimensionInput";

const NO_OP = () => {};

describe("DimensionInput component", () => {
	describe("validation", () => {
		it("should throw an error if the width is changed to be too small", () => {
			const onWidthChange = jest.fn().mockName("mock_onWidthChange");

			const wrapper = shallow(
				(
					<DimensionInput
						width={10}
						height={10}
						classes={{}}
						intl={intl}
						onWidthChange={onWidthChange}
						onHeightChange={NO_OP}
						onToggleKeepRatio={NO_OP}
					/>
				)
			);

			onWidthChange.mockClear();
			
			wrapper.find(TextField).filter("[name='width']").simulate("change", {
				target: {
					value: "1",
				},
			});

			expect(onWidthChange).toHaveBeenCalledWith({
				value: "1",
				error: "1 is less than the minimum width (10)",
			});
		});

		it("should throw an error if the width is changed to be too large", () => {
			const onWidthChange = jest.fn().mockName("mock_onWidthChange");

			const wrapper = shallow(
				(
					<DimensionInput
						width={10}
						height={10}
						classes={{}}
						intl={intl}
						onWidthChange={onWidthChange}
						onHeightChange={NO_OP}
						onToggleKeepRatio={NO_OP}
					/>
				)
			);

			onWidthChange.mockClear();
			
			wrapper.find(TextField).filter("[name='width']").simulate("change", {
				target: {
					value: "1000",
				},
			});

			expect(onWidthChange).toHaveBeenCalledWith({
				value: "1000",
				error: "1000 is greater than the maximum width (25)",
			});
		});

		it("should throw an error if the height is changed to be too small", () => {
			const onHeightChange = jest.fn().mockName("mock_onHeightChange");

			const wrapper = shallow(
				(
					<DimensionInput
						width={10}
						height={10}
						classes={{}}
						intl={intl}
						onHeightChange={onHeightChange}
						onWidthChange={NO_OP}
						onToggleKeepRatio={NO_OP}
					/>
				)
			);

			onHeightChange.mockClear();
			
			wrapper.find(TextField).filter("[name='height']").simulate("change", {
				target: {
					value: "1",
				},
			});

			expect(onHeightChange).toHaveBeenCalledWith({
				value: "1",
				error: "1 is less than the minimum height (10)",
			});
		});

		it("should throw an error if the height is changed to be too large", () => {
			const onHeightChange = jest.fn().mockName("mock_onHeightChange");

			const wrapper = shallow(
				(
					<DimensionInput
						width={10}
						height={10}
						classes={{}}
						intl={intl}
						onHeightChange={onHeightChange}
						onWidthChange={NO_OP}
						onToggleKeepRatio={NO_OP}
					/>
				)
			);

			onHeightChange.mockClear();
			
			wrapper.find(TextField).filter("[name='height']").simulate("change", {
				target: {
					value: "1000",
				},
			});

			expect(onHeightChange).toHaveBeenCalledWith({
				value: "1000",
				error: "1000 is greater than the maximum height (25)",
			});
		});

		it("should throw an error if the height is changed to be invalid", () => {
			const onHeightChange = jest.fn().mockName("mock_onHeightChange");

			const wrapper = shallow(
				(
					<DimensionInput
						width={10}
						height={10}
						classes={{}}
						intl={intl}
						onHeightChange={onHeightChange}
						onWidthChange={NO_OP}
						onToggleKeepRatio={NO_OP}
					/>
				)
			);

			onHeightChange.mockClear();
			
			wrapper.find(TextField).filter("[name='height']").simulate("change", {
				target: {
					value: "glorb",
				},
			});

			expect(onHeightChange).toHaveBeenCalledWith({
				value: "glorb",
				error: "glorb is not a valid value for the height",
			});
		});

		it("should throw an error if width is changed to be blank", () => {
			const onWidthChange = jest.fn().mockName("mock_onWidthChange");

			const wrapper = shallow(
				(
					<DimensionInput
						width={10}
						height={10}
						classes={{}}
						intl={intl}
						onWidthChange={onWidthChange}
						onHeightChange={NO_OP}
						onToggleKeepRatio={NO_OP}
					/>
				)
			);

			onWidthChange.mockClear();
			
			wrapper.find(TextField).filter("[name='width']").simulate("change", {
				target: {
					value: "",
				},
			});

			expect(onWidthChange).toHaveBeenCalledWith({
				value: "",
				error: "This field is required",
			});
		});

		it("should throw an error if height is changed to be blank", () => {
			const onHeightChange = jest.fn().mockName("mock_onHeightChange");

			const wrapper = shallow(
				(
					<DimensionInput
						width={10}
						height={10}
						classes={{}}
						intl={intl}
						onHeightChange={onHeightChange}
						onWidthChange={NO_OP}
						onToggleKeepRatio={NO_OP}
					/>
				)
			);

			onHeightChange.mockClear();
			
			wrapper.find(TextField).filter("[name='height']").simulate("change", {
				target: {
					value: "",
				},
			});

			expect(onHeightChange).toHaveBeenCalledWith({
				value: "",
				error: "This field is required",
			});
		});

		it("should validate on mount", () => {
			const onHeightChange = jest.fn().mockName("mock_onHeightChange");

			shallow(
				(
					<DimensionInput
						width={10}
						height={1}
						classes={{}}
						intl={intl}
						onHeightChange={onHeightChange}
						onWidthChange={NO_OP}
						onToggleKeepRatio={NO_OP}
					/>
				)
			);

			expect(onHeightChange).toHaveBeenCalledWith({
				value: 1,
				error: "1 is less than the minimum height (10)",
			});
		});
	});

	it("should trigger the onToggleKeepRatio callback", () => {
		const onToggleKeepRatio = jest.fn().mockName("mock_onToggleKeepRatio");

		const wrapper = shallow(
			(
				<DimensionInput
					width={10}
					height={10}
					classes={{}}
					intl={intl}
					onToggleKeepRatio={onToggleKeepRatio}
					onWidthChange={NO_OP}
					onHeightChange={NO_OP}
				/>
			)
		);

		onToggleKeepRatio.mockClear();
		
		expect(wrapper.find(ToggleButton)).toHaveProp("title", "Lock ratio");
		
		wrapper.find(ToggleButton).simulate("click");

		wrapper.setProps({
			keepRatio: true,
		});
		
		expect(wrapper.find(ToggleButton)).toHaveProp("title", "Unlock ratio");

		expect(onToggleKeepRatio).toHaveBeenCalledWith();
	});
});
