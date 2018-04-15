import React from "react";
import { mount } from "enzyme";
import { URLSearchParams } from "url";
import { wrapWithIntlProvider } from "@app/utils/test-utils";
import _CreateGame from "./index";

const CreateGame = wrapWithIntlProvider(_CreateGame);

const NO_OP = () => {};

describe("CreateGame component", () => {
	it("should set form state from the query string", () => {
		const params = {
			name: "testgame",
			width: "13",
			height: "10",
			playerLimit: "4",
		};

		const wrapper = mount(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
			/>
		);

		expect(wrapper.find("input[name='name']")).toHaveValue(params.name);
		expect(wrapper.find("input[name='width']")).toHaveValue(params.width);
		expect(wrapper.find("input[name='height']")).toHaveValue(params.height);
		expect(wrapper.find("input[name='playerLimit']")).toHaveValue(params.playerLimit);
	});

	it("should use default values when missing from the query string", () => {
		const params = {
			width: "13",
			height: "10",
		};

		const wrapper = mount(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
				location={{
					search: `?${new URLSearchParams(params)}`,
				}}
			/>
		);

		expect(wrapper.find("input[name='name']")).toHaveValue("");
		expect(wrapper.find("input[name='width']")).toHaveValue(params.width);
		expect(wrapper.find("input[name='height']")).toHaveValue(params.height);
		expect(wrapper.find("input[name='playerLimit']")).toHaveValue(params.playerLimit);
	});

	it("should have the submit button disabled if there are any errors", () => {
		const wrapper = mount(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
				location={{}}
				isNameValid
			/>
		);

		wrapper.find("input[name='name']").simulate("change", { target: { value: "testgame" } });
		// value too small!
		wrapper.find("input[name='width']").simulate("change", { target: { value: "1" } });

		expect(wrapper.find("button[type='submit']")).toBeDisabled();
	});

	it("should not have the submit button disabled if the form is valid", () => {
		const wrapper = mount(
			<CreateGame
				onCreateGame={NO_OP}
				onCheckName={NO_OP}
				location={{}}
				isNameValid
			/>
		);

		// Fill out the form with valid values
		wrapper.find("input[name='name']").simulate("change", { target: { value: "testgame" } });
		wrapper.find("input[name='width']").simulate("change", { target: { value: "20" } });
		wrapper.find("input[name='height']").simulate("change", { target: { value: "20" } });
		wrapper.find("input[name='playerLimit']").simulate("change", { target: { value: "5" } });

		expect(wrapper.find("button[type='submit']")).not.toBeDisabled();
	});
});
