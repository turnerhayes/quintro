import { take, put, call } from "redux-saga/effects";

import {
	changeUserProfile
} from "@app/actions";
import createChannel from "@app/sagas/client-channel";
import UserClient from "@app/api/user-client";

describe("games socket saga", () => {
	describe("changeUserProfileSaga", () => {
		it("should call changeUserProfile()", async () => {
			expect.assertions(1);

			jest.resetModules();

			const changeUserProfileStub = jest.fn()
				.mockName("mock-changeUserProfile");

			jest.doMock("@app/api/user-client", () => {
				class MockUserClient {
					changeUserProfile = changeUserProfileStub
				}

				return MockUserClient;
			});

			const sagaModule = await import("./users-socket");

			const saga = sagaModule.changeUserProfileSaga;

			const userID = "1";

			const updates = {
				name: {
					display: "Tester",
				},
			};

			const action = changeUserProfile({
				userID,
				updates,
			});

			const gen = saga(action);

			let next = gen.next().value;

			expect(next).toEqual(call(changeUserProfileStub, action.payload));
		});
	});

	describe("watchUserSocket", () => {
		it("should take from the user socket channel", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			jest.resetModules();

			const userID = "1";

			const updates = {
				name: {
					display: "Tester",
				},
			};

			const channel = createChannel(UserClient);

			const sagaModule = await import("./users-socket");

			const saga = sagaModule.watchUserSocket;

			const gen = saga(channel);

			let effect = gen.next();

			expect(effect.value).toEqual(take(channel));

			const action = ({
				userID,
				updates
			});

			effect = gen.next(action);

			expect(effect.value).toEqual(put(action));
		});
	});
});
