import React from "react";
import { shallow } from "enzyme";

import { Unwrapped as WinnerBanner } from "./WinnerBanner";

describe("PlayGame/WinnerBanner component", () => {
	it("should render a win message", () => {
		const wrapper = shallow(
			<WinnerBanner
				winnerColor="blue"
				classes={{
					winMessage: "winMessage",
				}}
			/>
		);

		expect(wrapper.find(".winMessage")).toExist();
	});
});
