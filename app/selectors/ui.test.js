import createReducer from "@app/reducers";
import {
	setUIState
} from "@app/actions";

import selectors from "./ui";

describe("UI selectors", () => {
	describe("getSetting", () => {
		it("should get a setting based on a string path", () => {
			const section = "test";
			const key = "foo";
			const value = "bar";
			const reducer = createReducer();

			const state = [
				setUIState({
					section,
					settings: {
						[key]: value,
					},
				}),
			].reduce(reducer, undefined);

			expect(selectors.getSetting(state.get("ui"), {
				section,
				settingName: key,
			})).toBe(value);
		});

		it("should get a setting based on an array path", () => {
			const section = "test";
			const key1 = "foo";
			const key2 = "bar";
			const value = "baz";
			const reducer = createReducer();

			const state = [
				setUIState({
					section,
					settings: {
						[key1]: {
							[key2]: value,
						},
					},
				}),
			].reduce(reducer, undefined);

			expect(selectors.getSetting(state.get("ui"), {
				section,
				settingName: [key1, key2],
			})).toBe(value);
		});
	});
});
