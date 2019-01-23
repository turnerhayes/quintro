import React from "react";
import { shallow } from "enzyme";
import { URLSearchParams } from "url";

import LocationHandler from "./LocationHandler";
import defaults from "lodash/defaults";


const NO_OP = () => {};

const DEFAULT_PROPS = {
	onWidthChange: NO_OP,
	onHeightChange: NO_OP,
	onPlayerLimitChange: NO_OP,
	onCreateGame: NO_OP,
	updateSearchString: NO_OP,
};

describe("LocationHandler", () => {
	it("should set form props from the query string", () => {
		// eslint-disable-next-line no-magic-numbers
		expect.assertions(3);

		const params = {
			width: "13",
			height: "10",
			playerLimit: "4",
		};

		const onWidthChange = jest.fn().mockName("mock_onWidthChange");
		const onHeightChange = jest.fn().mockName("mock_onHeightChange");
		const onPlayerLimitChange = jest.fn().mockName("mock_onPlayerLimitChange");

		shallow(
			<LocationHandler
				{
				...defaults(
					{
						location: {
							search: `?${new URLSearchParams(params)}`,
						},
						onWidthChange,
						onHeightChange,
						onPlayerLimitChange,
					},
					DEFAULT_PROPS
				)
				}
			/>
		);

		expect(onWidthChange).toHaveBeenCalledWith({
			value: params.width,
			error: null,
		});
		expect(onHeightChange).toHaveBeenCalledWith({
			value: params.height,
			error: null,
		});
		expect(onPlayerLimitChange).toHaveBeenCalledWith({
			value: params.playerLimit,
			error: null,
		});
	});

	it("should use default values when missing from the query string", () => {
		const params = {
			width: "13",
			height: "10",
		};

		const onWidthChange = jest.fn().mockName("mock_onWidthChange");
		const onHeightChange = jest.fn().mockName("mock_onHeightChange");

		// some values missing
		shallow(
			<LocationHandler
				{
				...defaults(
					{
						location: {
							search: `?${new URLSearchParams(params)}`,
						},
						onWidthChange,
						onHeightChange,
					},
					DEFAULT_PROPS
				)
				}
			/>
		);

		expect(onWidthChange).toHaveBeenCalledWith({
			value: params.width,
			error: null,
		});
		expect(onHeightChange).toHaveBeenCalledWith({
			value: params.height,
			error: null,
		});


		onWidthChange.mockClear();
		onHeightChange.mockClear();

		// all values missing
		shallow(
			<LocationHandler
				{
				...defaults(
					{
						location: {
							search: "?",
						},
						onWidthChange,
						onHeightChange,
					},
					DEFAULT_PROPS
				)
				}
			/>
		);

		expect(onWidthChange).not.toHaveBeenCalled();
		expect(onHeightChange).not.toHaveBeenCalled();
	});

	it("should use default values when the query string has invalid values", () => {
		const params = {
			width: "13qb",
			height: "~~",
			playerLimit: "**bb",
		};

		const onWidthChange = jest.fn().mockName("mock_onWidthChange");
		const onHeightChange = jest.fn().mockName("mock_onHeightChange");
		const onPlayerLimitChange = jest.fn().mockName("mock_onPlayerLimitChange");

		shallow(
			<LocationHandler
				{
				...defaults(
					{
						location: {
							search: `?${new URLSearchParams(params)}`,
						},
						onWidthChange,
						onHeightChange,
						onPlayerLimitChange,
						...params,
					},
					DEFAULT_PROPS
				)
				}
			/>
		);


		expect(onWidthChange).not.toHaveBeenCalled();
		expect(onHeightChange).not.toHaveBeenCalled();
		expect(onPlayerLimitChange).not.toHaveBeenCalled();
	});

	it("should change the field values when the query string changes", () => {
		const params = {
			width: "13",
			height: "10",
			playerLimit: "4",
		};

		const onWidthChange = jest.fn().mockName("mock_onWidthChange");
		const onHeightChange = jest.fn().mockName("mock_onHeightChange");
		const onPlayerLimitChange = jest.fn().mockName("mock_onPlayerLimitChange");

		const wrapper = shallow(
			<LocationHandler
				{
				...defaults(
					{
						location: {
							search: `?${new URLSearchParams(params)}`,
						},
						onWidthChange,
						onHeightChange,
						onPlayerLimitChange,
					},
					DEFAULT_PROPS
				)
				}
			/>
		);

		expect(onWidthChange).toHaveBeenCalledWith({
			value: params.width,
			error: null,
		});
		expect(onHeightChange).toHaveBeenCalledWith({
			value: params.height,
			error: null,
		});
		expect(onPlayerLimitChange).toHaveBeenCalledWith({
			value: params.playerLimit,
			error: null,
		});

		onWidthChange.mockReset();
		onHeightChange.mockReset();
		onPlayerLimitChange.mockReset();

		params.width = "21";
		params.height = "20";
		params.playerLimit = "6";

		wrapper.setProps({
			location: {
				search: `?${new URLSearchParams(params)}`,
			},
		});

		expect(onWidthChange).toHaveBeenCalledWith({
			value: params.width,
			error: null,
		});
		expect(onHeightChange).toHaveBeenCalledWith({
			value: params.height,
			error: null,
		});
		expect(onPlayerLimitChange).toHaveBeenCalledWith({
			value: params.playerLimit,
			error: null,
		});
	});
});
