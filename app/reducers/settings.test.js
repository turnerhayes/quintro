import {
	changeSetting,
} from "@app/actions";

import reducer from "./settings";

describe("settings reducers", () => {
	it("CHANGE_SETTING", () => {
		const setting1Name = "testSetting";

		let setting1Value = "foo";

		let state = reducer(undefined, changeSetting({
			[setting1Name]: setting1Value,
		}));

		expect(state.get(setting1Name)).toBe(setting1Value);

		const setting2Name = "testSetting2";

		const setting2Value = "baz";

		setting1Value = "bar";

		state = reducer(state, changeSetting({
			[setting1Name]: setting1Value,
			[setting2Name]: setting2Value,
		}));

		expect(state.get(setting1Name)).toBe(setting1Value);
		expect(state.get(setting2Name)).toBe(setting2Value);
	});
});
