import React from "react";
import { shallow } from "enzyme";
import TextField from "@material-ui/core/TextField";

import { intl } from "@app/utils/test-utils";

import { Unwrapped as PlayerLimitInput } from "./PlayerLimitInput";

describe("DimensionInput component", () => {
	describe("validation", () => {
		it("should throw an error if the player limit is changed to be too small", () => {
			const onPlayerLimitChange = jest.fn().mockName("mock_onPlayerLimitChange");

			const wrapper = shallow(
				(
					<PlayerLimitInput
						playerLimit={4}
						classes={{}}
						intl={intl}
						onPlayerLimitChange={onPlayerLimitChange}
					/>
				)
			);

			onPlayerLimitChange.mockClear();
			
			wrapper.find(TextField).filter("[name='playerLimit']").simulate("change", {
				target: {
					value: "1",
				},
			});

			expect(onPlayerLimitChange).toHaveBeenCalledWith({
				value: "1",
				error: "1 is less than the minimum number of players (3)",
			});
		});

		it("should throw an error if the player limit is changed to be too large", () => {
			const onPlayerLimitChange = jest.fn().mockName("mock_onPlayerLimitChange");

			const wrapper = shallow(
				(
					<PlayerLimitInput
						playerLimit={4}
						classes={{}}
						intl={intl}
						onPlayerLimitChange={onPlayerLimitChange}
					/>
				)
			);

			onPlayerLimitChange.mockClear();
			
			wrapper.find(TextField).filter("[name='playerLimit']").simulate("change", {
				target: {
					value: "100",
				},
			});

			expect(onPlayerLimitChange).toHaveBeenCalledWith({
				value: "100",
				error: "100 is greater than the maximum number of players (8)",
			});
		});

		it("should throw an error if the player limit is changed to be an invalid value", () => {
			const onPlayerLimitChange = jest.fn().mockName("mock_onPlayerLimitChange");

			const wrapper = shallow(
				(
					<PlayerLimitInput
						playerLimit={4}
						classes={{}}
						intl={intl}
						onPlayerLimitChange={onPlayerLimitChange}
					/>
				)
			);

			onPlayerLimitChange.mockClear();
			
			wrapper.find(TextField).filter("[name='playerLimit']").simulate("change", {
				target: {
					value: "glorb",
				},
			});

			expect(onPlayerLimitChange).toHaveBeenCalledWith({
				value: "glorb",
				error: "glorb is not a valid value for the player limit",
			});
		});

		it("should throw an error if the player limit is changed to be empty", () => {
			const onPlayerLimitChange = jest.fn().mockName("mock_onPlayerLimitChange");

			const wrapper = shallow(
				(
					<PlayerLimitInput
						playerLimit={4}
						classes={{}}
						intl={intl}
						onPlayerLimitChange={onPlayerLimitChange}
					/>
				)
			);

			onPlayerLimitChange.mockClear();
			
			wrapper.find(TextField).filter("[name='playerLimit']").simulate("change", {
				target: {
					value: "",
				},
			});

			expect(onPlayerLimitChange).toHaveBeenCalledWith({
				value: "",
				error: "This field is required",
			});
		});

		it("should validate on component mount", () => {
			const onPlayerLimitChange = jest.fn().mockName("mock_onPlayerLimitChange");

			shallow(
				(
					<PlayerLimitInput
						playerLimit=""
						classes={{}}
						intl={intl}
						onPlayerLimitChange={onPlayerLimitChange}
					/>
				)
			);

			expect(onPlayerLimitChange).toHaveBeenCalledWith({
				value: "",
				error: "This field is required",
			});
		});
	});
});
