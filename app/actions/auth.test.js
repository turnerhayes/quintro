import { isFSA } from "flux-standard-action";

import {
	login,
	logout,
	LOGIN,
	LOGOUT,
} from "./auth";

describe("auth action creators", () => {
	describe("login", () => {
		it("should return a LOGIN action", () => {
			const action = login({ provider: "facebook" });

			expect(isFSA(action)).toBeTruthy();

			expect(action).toEqual({
				type: LOGIN,
				payload: {
					provider: "facebook",
				},
			});
		});
	});

	describe("logout", () => {
		it("should return a LOGOUT action", () => {
			const action = logout();

			expect(isFSA(action)).toBeTruthy();

			expect(action).toEqual({
				type: LOGOUT,
			});
		});
	});
});
