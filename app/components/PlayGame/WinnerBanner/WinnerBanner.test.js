import React from "react";
import { shallow } from "enzyme";

import Config from "@app/config";
import { intl, formatMessage } from "@app/utils/test-utils";

import messages from "./messages";
import { Unwrapped as WinnerBanner } from "./WinnerBanner";

describe("PlayGame/WinnerBanner component", () => {
	it("should render a win message", () => {
		const winnerColor = "blue";

		const wrapper = shallow(
			<WinnerBanner
				winnerColor={winnerColor}
				classes={{
					winMessage: "winMessage",
				}}
			/>
		);

		expect(wrapper.find(".winMessage")).toExist();
		expect(
			wrapper.find(".winMessage")
				.find("FormattedMessage")
				.shallow(
					{
						context: {
							intl,
						},
					}
				)
		).toHaveText(
			formatMessage(
				messages.winMessage,
				{
					winnerColor: Config.game.colors.get(winnerColor).name,
				}
			)
		);
	});
});
