import React from "react";
import { shallow } from "enzyme";
import { URLSearchParams } from "url";
import sinon from "sinon";
import Button from "@material-ui/core/Button";

import { intl } from "@app/utils/test-utils";
import Config from "@app/config";
import { Unwrapped as CreateGame } from "./CreateGame";
import { CHECK_NAME_DEBOUCE_DURATION_IN_MILLISECONDS } from "./CreateGame";

const NO_OP = () => {};

describe("CreateGame component", () => {
	it("should set form state from the query string", () => {
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

		expect(wrapper.find("TextField[name='name']")).toHaveValue(params.name);
		expect(wrapper.find("TextField[name='width']")).toHaveValue(params.width);
		expect(wrapper.find("TextField[name='height']")).toHaveValue(params.height);
		expect(wrapper.find("TextField[name='playerLimit']")).toHaveValue(params.playerLimit);
	});

	it("should use default values when missing from the query string", () => {
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

		expect(wrapper.find("TextField[name='name']")).toHaveValue("");
		expect(wrapper.find("TextField[name='width']")).toHaveValue(params.width);
		expect(wrapper.find("TextField[name='height']")).toHaveValue(params.height);
		expect(wrapper.find("TextField[name='playerLimit']")).toHaveValue(Config.game.players.min + "");

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

		expect(wrapper.find("TextField[name='name']")).toHaveValue("");
		expect(wrapper.find("TextField[name='width']")).toHaveValue(Config.game.board.width.min + "");
		expect(wrapper.find("TextField[name='height']")).toHaveValue(Config.game.board.height.min + "");
		expect(wrapper.find("TextField[name='playerLimit']")).toHaveValue(Config.game.players.min + "");
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

		expect(wrapper.find("TextField[name='name']")).toHaveValue("");
		expect(wrapper.find("TextField[name='width']")).toHaveValue(Config.game.board.width.min + "");
		expect(wrapper.find("TextField[name='height']")).toHaveValue(Config.game.board.height.min + "");
		expect(wrapper.find("TextField[name='playerLimit']")).toHaveValue(Config.game.players.min + "");
	});

	it("should have an error when a query string value is too small", () => {
		const params = {
			width: "1",
			height: "1",
			playerLimit: "1",
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

		expect(wrapper.find("TextField[name='width']")).toHaveProp("error", true);
		expect(wrapper.find("TextField[name='height']")).toHaveProp("error", true);
		expect(wrapper.find("TextField[name='playerLimit']")).toHaveProp("error", true);
	});

	it("should have an error when a query string value is too large", () => {
		const params = {
			width: "1000",
			height: "1000",
			playerLimit: "1000",
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

		expect(wrapper.find("TextField[name='width']")).toHaveProp("error", true);
		expect(wrapper.find("TextField[name='height']")).toHaveProp("error", true);
		expect(wrapper.find("TextField[name='playerLimit']")).toHaveProp("error", true);
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

		expect(wrapper.find("TextField[name='name']")).toHaveValue(params.name);
		expect(wrapper.find("TextField[name='width']")).toHaveValue(params.width);
		expect(wrapper.find("TextField[name='height']")).toHaveValue(params.height);
		expect(wrapper.find("TextField[name='playerLimit']")).toHaveValue(params.playerLimit);

		params.name = "othertest";
		params.width = "21";
		params.height = "20";
		params.playerLimit = "6";

		wrapper.setProps({
			location: {
				search: `?${new URLSearchParams(params)}`,
			},
		});

		expect(wrapper.find("TextField[name='name']")).toHaveValue(params.name);
		expect(wrapper.find("TextField[name='width']")).toHaveValue(params.width);
		expect(wrapper.find("TextField[name='height']")).toHaveValue(params.height);
		expect(wrapper.find("TextField[name='playerLimit']")).toHaveValue(params.playerLimit);
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
		wrapper.find("TextField[name='width']").simulate("change", { target: { value: "1" } });
		// value too large!
		wrapper.find("TextField[name='height']").simulate("change", { target: { value: "1000" } });

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
		wrapper.find("TextField[name='width']").simulate("change", { target: { value: "20" } });
		wrapper.find("TextField[name='height']").simulate("change", { target: { value: "20" } });
		wrapper.find("TextField[name='playerLimit']").simulate("change", { target: { value: "5" } });

		expect(wrapper.find(Button).filter("[type='submit']")).not.toBeDisabled();
	});

	it("should have error when a required field is omitted", () => {
		const params = {
			name: "test",
			width: "15",
			height: "15",
			playerLimit: "3",
		};

		const wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
				isNameValid
				classes={{}}
				intl={intl}
			/>
		);

		[
			"width",
			"height",
			"playerLimit",
		].forEach(
			(inputName) => {
				expect(wrapper.find(`TextField[name="${inputName}"]`)).toHaveProp("error", false);

				wrapper.find(`TextField[name="${inputName}"]`).simulate("change", { target: { value: "" } });

				expect(wrapper.find(`TextField[name="${inputName}"]`)).toHaveProp("error", true);
			}
		);
	});

	it("should have error when a field has invalid value", () => {
		const params = {
			name: "test",
			width: "15",
			height: "15",
			playerLimit: "3",
		};

		const wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
				isNameValid
				classes={{}}
				intl={intl}
			/>
		);


		[
			"width",
			"height",
			"playerLimit",
		].forEach(
			(inputName) => {
				expect(wrapper.find(`TextField[name="${inputName}"]`)).toHaveProp("error", false);

				wrapper.find(`TextField[name="${inputName}"]`).simulate("change", { target: { value: "glorb" } });

				expect(wrapper.find(`TextField[name="${inputName}"]`)).toHaveProp("error", true);
			}
		);
	});

	it("should have error when a field value is too small", () => {
		const params = {
			name: "test",
			width: "15",
			height: "15",
			playerLimit: "3",
		};

		const wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
				isNameValid
				classes={{}}
				intl={intl}
			/>
		);


		[
			"width",
			"height",
			"playerLimit",
		].forEach(
			(inputName) => {
				expect(wrapper.find(`TextField[name="${inputName}"]`)).toHaveProp("error", false);
				
				wrapper.find(`TextField[name="${inputName}"]`).simulate("change", { target: { value: "1" } });

				expect(wrapper.find(`TextField[name="${inputName}"]`)).toHaveProp("error", true);
			}
		);
	});

	it("should have error when a field value is too large", () => {
		const params = {
			name: "test",
			width: "15",
			height: "15",
			playerLimit: "3",
		};

		const wrapper = shallow(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
				isNameValid
				classes={{}}
				intl={intl}
			/>
		);


		[
			"width",
			"height",
			"playerLimit",
		].forEach(
			(inputName) => {
				expect(wrapper.find(`TextField[name="${inputName}"]`)).toHaveProp("error", false);

				wrapper.find(`TextField[name="${inputName}"]`).simulate("change", { target: { value: "1000" } });

				expect(wrapper.find(`TextField[name="${inputName}"]`)).toHaveProp("error", true);
			}
		);
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
					value: values.name + "",
				},
			},
		);
		wrapper.find("TextField[name='width']").simulate(
			"change",
			{
				target: {
					value: values.width + "",
				},
			},
		);
		wrapper.find("TextField[name='height']").simulate(
			"change",
			{
				target: {
					value: values.height + "",
				},
			},
		);
		wrapper.find("TextField[name='playerLimit']").simulate(
			"change",
			{
				target: {
					value: values.playerLimit + "",
				},
			},
		);

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
