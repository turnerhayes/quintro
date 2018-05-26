/* global Promise */

import createChannel from "./client-channel";

describe("Client channel", () => {
	const action = {
		type: "@@QUINTRO/TEST",
		payload: "foo",
	};

	const cancel = jest.fn().mockName("mock-ClientCancel");

	class TestClient {
		constructor({ dispatch }) {
			this.dispatch = dispatch;
		}

		doSomethingThatDispatchesAction = () => this.dispatch(action)

		dispose = cancel
	}

	it("should return a cancel function", () => {
		jest.resetModules();
		cancel.mockReset();

		const channel = createChannel(TestClient);

		channel.close();

		expect(cancel).toHaveBeenCalledWith();
	});

	it("should dispatch from the channel", async () => {
		expect.assertions(1);

		jest.resetModules();
		cancel.mockReset();

		const channel = createChannel(TestClient);

		const takePromise = new Promise(
			(resolve) => channel.take((action) => {
				resolve(action);
			})
		);

		channel.client.doSomethingThatDispatchesAction();

		const result = await takePromise;

		expect(result).toEqual(action);
	});
});
