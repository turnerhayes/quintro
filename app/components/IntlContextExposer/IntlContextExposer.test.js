import React from "react";
import { shallow } from "enzyme";

import { intl } from "@app/utils/test-utils";
import { translationMessages } from "@app/i18n";

import IntlContextExposer, { formatMessage } from "./IntlContextExposer";

describe("IntlContextExposer component", () => {
	it("should provide a formatMessage function that uses the intl object", () => {
		jest.spyOn(intl, "formatMessage");
		
		shallow(
			(
				<IntlContextExposer
				/>
			),
			{
				context: {
					intl,
				},
			}
		);

		const id = Object.keys(translationMessages.en)[0];

		const message = { id };

		formatMessage(message);

		expect(intl.formatMessage).toHaveBeenCalledWith(message);
	});
});
