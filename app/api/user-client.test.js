/* global Promise */

import { SocketIO, Server } from "mock-socket";

import Config from "@app/config";
import {
	updateUserProfile,
} from "@app/actions";


describe("User client API", () => {
	jest.doMock("socket.io-client", () => SocketIO);

	let server = null;

	let connectPromise = null;

	let UserClient;

	const dispatch = jest.fn().mockName("mock-clientDispatch");

	let client = null;

	beforeEach(async () => {
		server = new Server(Config.websockets.url);

		connectPromise = new Promise(
			(resolve) => server.on("connection", resolve)
		);

		jest.resetModules();

		dispatch.mockReset();

		const module = await import("./user-client");

		UserClient = module.default;

		client = new UserClient({
			dispatch,
		});
	});

	afterEach(() => {
		server.close();

		if (!client.isDisposed) {
			client.dispose();
		}

		server = null;

		connectPromise = null;

		client = null;
	});

	it("should throw an error if not passed a dispatch function", () => {
		expect(() => {
			new UserClient({});
		}).toThrow("Cannot construct a UserClient without a dispatch function");

		expect(() => {
			new UserClient({
				dispatch: "this is wrong",
			});
		}).toThrow("Cannot construct a UserClient without a dispatch function");
	});

	it("should clear handlers on dispose()", () => {
		jest.spyOn(client, "off");

		client.dispose();

		expect(client.off).toHaveBeenCalledWith(
			"users:profile-changed",
			client.onUserProfileChanged
		);
	});

	describe("action dispatches", () => {
		it("should dispatch an updateUserProfile action on a users:profile-changed socket message", async () => {
			expect.assertions(1);

			await connectPromise;

			const user = {
				id: "1",
				name: {
					display: "Tester Test",
				},
			};

			server.emit("users:profile-changed", { user });

			expect(dispatch).toHaveBeenCalledWith(updateUserProfile({
				user,
			}));
		});
	});

	describe("websocket emits", () => {
		it("should emit a users:change-profile message to the server from changeUserProfile()", async () => {
			expect.assertions(1);

			await connectPromise;

			let messageData;

			const userID = "1";

			const updates = {
				name: {
					display: "Test Testerson",
				},
			};

			const changeProfileMessagePromise = new Promise(
				(resolve) => {
					server.on("users:change-profile", (data) => {
						messageData = data;

						resolve();
					});
				}
			);

			client.changeUserProfile({
				userID,
				updates,
			});

			await changeProfileMessagePromise;

			expect(messageData).toEqual({
				userID,
				updates,
			});
		});
	});
});
