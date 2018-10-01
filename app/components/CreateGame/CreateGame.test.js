import React from "react";
import { shallow } from "enzyme";
import { URLSearchParams } from "url";
import Button from "@material-ui/core/Button";

import { intl } from "@app/utils/test-utils";
import Config from "@app/config";
import {
	DimensionInput,
	PlayerLimitInput
} from "@app/components/GameFormControls";

import { Unwrapped as CreateGame } from "./CreateGame";

const NO_OP = () => {};

function renderInputs(wrapper) {
	// Render the dimension input so that its lifecycle events trigger. Have to get down
	// to the bare, unwrapped component
	wrapper.find(DimensionInput).shallow().shallow({
		context: {
			intl,
		},
	}).shallow();

	// see above
	wrapper.find(PlayerLimitInput).shallow().shallow({
		context: {
			intl,
		},
	}).shallow();
}

function expectValues(wrapper, expectedValues) {
	renderInputs(wrapper);

	if ("width" in expectedValues) {
		expect(wrapper).toHaveState("width", expectedValues.width);
	}

	if ("height" in expectedValues) {
		expect(wrapper).toHaveState("height", expectedValues.height);
	}

	if ("playerLimit" in expectedValues) {
		expect(wrapper).toHaveState("playerLimit", expectedValues.playerLimit);
	}
}

describe("CreateGame component", () => {
	it("should set form state from the query string", () => {
		// eslint-disable-next-line no-magic-numbers
		expect.assertions(3);

		const params = {
			width: "13",
			height: "10",
			playerLimit: "4",
		};

		const wrapper = shallow(
			<CreateGame
				intl={intl}
				onCreateGame={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
				classes={{}}
			/>
		);

		renderInputs(wrapper);

		expectValues(wrapper, params);
	});

	it("should use default values when missing from the query string", () => {
		// eslint-disable-next-line no-magic-numbers
		expect.assertions(6);
		
		const params = {
			width: "13",
			height: "10",
		};

		// some values missing
		let wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
				classes={{}}
				intl={intl}
			/>
		);

		expectValues(wrapper, {
			...params,
			playerLimit: Config.game.players.min.toString(),
		});

		// all values missing
		wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				location={{
					search: "?",
				}}
				classes={{}}
				intl={intl}
			/>
		);

		expectValues(wrapper, {
			width: Config.game.board.width.min.toString(),
			height: Config.game.board.height.min.toString(),
			playerLimit: Config.game.players.min.toString(),
		});
	});

	it("should use default values when the query string has invalid values", () => {
		const params = {
			width: "13qb",
			height: "~~",
			playerLimit: "**bb",
		};

		const wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
				classes={{}}
				intl={intl}
			/>
		);

		expectValues(wrapper, {
			width: Config.game.board.width.min.toString(),
			height: Config.game.board.height.min.toString(),
			playerLimit: Config.game.players.min.toString(),
		});
	});

	it("should change the field values when the query string changes", () => {
		const params = {
			width: "13",
			height: "10",
			playerLimit: "4",
		};

		const wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
				classes={{}}
				intl={intl}
			/>
		);

		expectValues(wrapper, params);

		params.width = "21";
		params.height = "20";
		params.playerLimit = "6";

		wrapper.setProps({
			location: {
				search: `?${new URLSearchParams(params)}`,
			},
		});

		expectValues(wrapper, params);
	});

	it("should have the submit button disabled if there are any errors", () => {
		const wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				location={{}}
				classes={{}}
				intl={intl}
			/>
		);

		// value too small!
		wrapper.find(DimensionInput).simulate("widthChange", { value: "1", error: "foo" });
		// value too large!
		wrapper.find(DimensionInput).simulate("heightChange", { value: "1000", error: "foo" });

		expect(wrapper.find(Button).filter("[type='submit']")).toBeDisabled();
	});

	it("should not have the submit button disabled if the form is valid", () => {
		const wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				location={{}}
				classes={{}}
				intl={intl}
			/>
		);

		// Fill out the form with valid values
		wrapper.find(DimensionInput).simulate("widthChange", { value: "20" });
		wrapper.find(DimensionInput).simulate("heightChange", { value: "20" });
		wrapper.find(PlayerLimitInput).simulate("playerLimitChange", { value: "5" });

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
				onCreateGame={onCreateGame}
				location={{}}
				classes={{}}
				intl={intl}
			/>
		);

		wrapper.find(DimensionInput).simulate("widthChange", {
			value: values.width.toString(),
		});

		wrapper.find(DimensionInput).simulate("heightChange", {
			value: values.height.toString(),
		});

		wrapper.find(PlayerLimitInput).simulate("playerLimitChange", {
			value: values.playerLimit.toString(),
		});

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
