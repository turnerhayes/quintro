import React from "react";
import { shallow } from "enzyme";
import Button from "@material-ui/core/Button";
import defaults from "lodash/defaults";

import { intl } from "@app/utils/test-utils";

import { Unwrapped as CreateGame } from "./CreateGame";

const NO_OP = () => {};

const DEFAULT_PROPS = {
	onCreateGame: NO_OP,
	onWidthChange: NO_OP,
	onHeightChange: NO_OP,
	onPlayerLimitChange: NO_OP,
	onToggleKeepRatio: NO_OP,
	classes: {},
	intl,
};

describe("CreateGame component", () => {
	it("should have the submit button disabled if there are any errors", () => {
		const wrapper = shallow(
			<CreateGame
				{
				...defaults(
					{
						// value too small!
						width: "1",
						widthError: "foo",
						// value too large!
						height: "1000",
						heightError: "foo",
					},
					DEFAULT_PROPS
				)
				}
			/>
		);

		expect(wrapper.find(Button).filter("[type='submit']")).toBeDisabled();
	});

	it("should not have the submit button disabled if the form is valid", () => {
		const wrapper = shallow(
			<CreateGame
				{
				...defaults(
					{
						width: "20",
						height: "20",
						playerLimit: "5",
					},
					DEFAULT_PROPS
				)
				}
			/>
		);

		expect(wrapper.find(Button).filter("[type='submit']")).not.toBeDisabled();
	});

	it("should call onCreateGame handler when submitted", () => {
		const onCreateGame = jest.fn();

		const values = {
			width: 20,
			height: 20,
			playerLimit: 4,
		};

		const wrapper = shallow(
			<CreateGame
				{
				...defaults(
					{
						onCreateGame,
						...values
					},
					DEFAULT_PROPS
				)
				}
			/>
		);

		// Ideally, we'd just simulate click on the submit button here,
		// but that doesn't trigger a submit even on the form. Nor does
		// getting the actual DOM node and "clicking" it via JSDom (i.e.
		// `wrapper.find("button[type='submit']").getDOMNode().click()`)
		// for some reason. https://github.com/jsdom/jsdom/issues/1026
		// suggests that the latter *should* work...
		wrapper.find("form").simulate("submit", {
			preventDefault() {},
		});

		expect(onCreateGame).toHaveBeenCalledWith(values);
	});
});
