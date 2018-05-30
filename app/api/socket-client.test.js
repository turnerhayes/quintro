/* global Promise */

import { SocketIO, Server } from "mock-socket";

import Config from "@app/config";


describe("Socket client base class", () => {
	jest.doMock("socket.io-client", () => SocketIO);

	let server = null;

	let connectPromise = null;

	let SocketClient;

	let client = null;


	beforeEach(async () => {
		server = new Server(Config.websockets.url);

		connectPromise = new Promise(
			(resolve) => server.on("connection", resolve)
		);

		jest.resetModules();

		const module = await import("./socket-client");

		SocketClient = module.default;

		client = new SocketClient();
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

	describe("isDisposed", () => {
		it("should be true after client is disposed and false before", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			await connectPromise;

			expect(client.isDisposed).toBeFalsy();

			client.dispose();

			expect(client.isDisposed).toBeTruthy();
		});
	});

	describe("connection errors", () => {
		[
			"connect_error",
			"connect_timeout",
			"reconnect_error",
			"reconnect_failed",
		].forEach(
			(reason) => {
				it(`should emit a connection:closed message on ${reason}`, async () => {
					expect.assertions(1);

					await connectPromise;

					const connectionClosedPromise = new Promise(
						(resolve) => server.on("connection:closed", resolve)
					);

					const error = {
						message: "foo",
					};

					server.emit(reason, error);

					const messageArgs = await connectionClosedPromise;

					expect(messageArgs).toEqual({
						error,
						reason,
					});
				});
			}
		);
	});

	describe("reconnection", () => {
		it("should emit a connection:restored message on reconnect", async () => {
			expect.assertions(1);

			await connectPromise;

			// close the connection so that it can be restored
			server.emit("connect_error");

			const reconnectPromise = new Promise(
				(resolve) => server.on("connection:restored", (event) => {
					resolve(event);
				})
			);

			const error = {
				message: "foo",
			};

			server.emit("reconnect", error);

			const messageEvent = await reconnectPromise;

			expect(messageEvent).toHaveProperty("type", "connection:restored");
		});
	});
});
