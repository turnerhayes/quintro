/* eslint-env jest */

import { fromJS } from "immutable";
import * as userSelectors from "./users";
import * as immutableMatchers from "jest-immutable-matchers";

describe("users selector", () => {
	beforeEach(() => jest.addMatchers(immutableMatchers));

	const userID = "my-user-id";

	const user = fromJS({
		id: userID,
		name: {
			first: "Testy",
			last: "Testerson",
			display: "Testmaster Flash",
		}
	});

	const initialState = fromJS({
		users: {
			items: {
				[userID]: user,
				"other-user": {
					id: "other-user",
					name: {
						first: "Other",
						last: "User",
						display: "Other User",
					},
				},
			},
			currentID: null,
		},
	});

	describe("getLoggedInUser", () => {
		it("should return nothing when no user is logged in", () => {
			const loggedInUser = userSelectors.getLoggedInUser(initialState);

			expect(loggedInUser).toBeUndefined();
		});

		it("should return the user when user is logged in", () => {
			const loggedInUser = userSelectors.getLoggedInUser(
				initialState.setIn(["users", "currentID"], userID)
			);

			expect(loggedInUser).toEqualImmutable(user);
		});
	});

	describe("getCurrentUser", () => {
		it("should return nothing when there is no current user", () => {
			const currentUser = userSelectors.getCurrentUser(initialState);

			expect(currentUser).toBeUndefined();
		});

		it("should return the user when it is current user", () => {
			const modifiedUser = user.set("isMe", true);
			const currentUser = userSelectors.getCurrentUser(
				initialState.setIn(["users", "items", userID], modifiedUser)
			);

			expect(currentUser).toEqualImmutable(modifiedUser);
		});

		it("should return the logged in user when there is one", () => {
			const modifiedUser = user.set("isMe", true);
			const state = initialState.setIn(["users", "items", userID], modifiedUser)
				.setIn(["users", "currentID"], userID);
			const currentUser = userSelectors.getCurrentUser(state);
			const loggedInUser = userSelectors.getLoggedInUser(state);

			expect(currentUser).toEqualImmutable(loggedInUser);
		});
	});
});
