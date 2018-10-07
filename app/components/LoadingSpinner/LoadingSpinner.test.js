import React from "react";
import { shallow } from "enzyme";
import Icon from "@material-ui/core/Icon";

import LoadingSpinner from "./LoadingSpinner";

describe("LoadingSpinner component", () => {
	it("should render a spinner icon", () => {
		const wrapper = shallow(
			<LoadingSpinner
			/>
		).shallow();

		expect(wrapper.find(Icon)).toExist();
	});
});
