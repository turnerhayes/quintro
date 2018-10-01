import { call } from "redux-saga/effects";

import {
	login,
	logout
} from "@app/actions";

import {
	loginSaga,
	logoutSaga
} from "./authentication";

describe("authentication saga", () => {
	describe("login saga", () => {
		it("should change document location", () => {
			const gen = loginSaga(login({
				provider: "facebook",
			}));

			const result = gen.next();

			expect(result.value).toEqual(
				call(
					[
						document.location,
						document.location.assign,
					],
					"/auth/facebook?redirectTo=%2F"
				)
			);

			expect(gen.next().done).toBeTruthy();
		});

		it("should throw an error if passed an invalid provider", () => {
			const gen = loginSaga(login({
				provider: "notarealone",
			}));

			expect(
				() => gen.next()
			).toThrow('Unrecognized login provider "notarealone"');
		});
	});

	describe("logout saga", () => {
		it("should change document location", () => {
			const gen = logoutSaga(logout());

			const result = gen.next();

			expect(result.value).toEqual(
				call(
					[
						document.location,
						document.location.assign,
					],
					"/auth/logout?redirectTo=%2F"
				)
			);

			expect(gen.next().done).toBeTruthy();
		});
	});
});
