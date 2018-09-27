import React from "react";
import { shallow } from "enzyme";
import { URLSearchParams } from "url";
import sinon from "sinon";
import Button from "@material-ui/core/Button";

import { intl } from "@app/utils/test-utils";
import Config from "@app/config";
import {
	DimensionInput,
	PlayerLimitInput
} from "@app/components/GameFormControls";

import { Unwrapped as CreateGame } from "./CreateGame";
import { CHECK_NAME_DEBOUCE_DURATION_IN_MILLISECONDS } from "./CreateGame";

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

	if ("name" in expectedValues) {
		expect(wrapper).toHaveState("name", expectedValues.name);
	}

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
		expect.assertions(4);

		const params = {
			name: "testgame",
			width: "13",
			height: "10",
			playerLimit: "4",
		};

		const wrapper = shallow(
			<CreateGame
				intl={intl}
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
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
		expect.assertions(8);
		
		const params = {
			width: "13",
			height: "10",
		};

		// some values missing
		let wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
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
			name: "",
		});

		// all values missing
		wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
				location={{
					search: "?",
				}}
				classes={{}}
				intl={intl}
			/>
		);

		expectValues(wrapper, {
			name: "",
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
				onCheckName={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
				classes={{}}
				intl={intl}
			/>
		);

		expectValues(wrapper, {
			name: "",
			width: Config.game.board.width.min.toString(),
			height: Config.game.board.height.min.toString(),
			playerLimit: Config.game.players.min.toString(),
		});
	});

	it("should change the field values when the query string changes", () => {
		const params = {
			name: "testgame",
			width: "13",
			height: "10",
			playerLimit: "4",
		};

		const wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
				classes={{}}
				intl={intl}
			/>
		);

		expectValues(wrapper, params);

		params.name = "othertest";
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
				onCheckName={NO_OP}
				location={{}}
				isNameValid
				classes={{}}
				intl={intl}
			/>
		);

		wrapper.find("TextField[name='name']").simulate("change", { target: { value: "testgame" } });
		
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
				onCheckName={NO_OP}
				location={{}}
				isNameValid
				classes={{}}
				intl={intl}
			/>
		);

		// Fill out the form with valid values
		wrapper.find("TextField[name='name']").simulate("change", { target: { value: "testgame" } });
		wrapper.find(DimensionInput).simulate("widthChange", { value: "20" });
		wrapper.find(DimensionInput).simulate("heightChange", { value: "20" });
		wrapper.find(PlayerLimitInput).simulate("playerLimitChange", { value: "5" });

		expect(wrapper.find(Button).filter("[type='submit']")).not.toBeDisabled();
	});

	it("should call onCheckName handler debounced", () => {
		const clock = sinon.useFakeTimers();

		const onCheckName = jest.fn();

		const wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={onCheckName}
				location={{}}
				classes={{}}
				intl={intl}
			/>
		);

		const nameInput = wrapper.find("TextField[name='name']");

		const NUMBER_OF_CHANGES = 5;

		for (let i = 0; i < NUMBER_OF_CHANGES; i++) {
			nameInput.simulate(
				"change",
				{
					target: {
						value: new Array(i + 1).fill("a").join(""),
					},
				}
			);
		}

		clock.tick(CHECK_NAME_DEBOUCE_DURATION_IN_MILLISECONDS);

		expect(onCheckName).toHaveBeenCalledTimes(1);
		expect(onCheckName).toHaveBeenCalledWith({ name: "aaaaa" });

		clock.restore();
	});

	it("should call onCreateGame handler when submitted", () => {
		const onCreateGame = jest.fn();

		const values = {
			name: "testgame",
			width: 20,
			height: 20,
			playerLimit: 4,
		};

		const wrapper = shallow(
			<CreateGame
				onCreateGame={onCreateGame}
				onCheckName={NO_OP}
				location={{}}
				classes={{}}
				intl={intl}
			/>
		);

		wrapper.find("TextField[name='name']").simulate(
			"change",
			{
				target: {
					value: values.name,
				},
			},
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

		wrapper.setProps({ isNameValid: true });

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
