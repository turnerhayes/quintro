import React from "react";
import { shallow } from "enzyme";
import { Unwrapped as Marble } from "./Marble";

describe("Marble component", () => {
	it("should render a Marble div", () => {
		const wrapper = shallow(
			<Marble
				classes={{}}
				color="blue"
			/>
		);

		expect(wrapper).not.toBeEmptyRender();
	});

	it("should have the empty class if no color is specified", () => {
		const emptyClass = "empty";

		const wrapper = shallow(
			<Marble
				classes={{
					empty: emptyClass,
				}}
				color={null}
			/>
		);

		expect(wrapper.filter(`.${emptyClass}`)).toExist();
	});
});
