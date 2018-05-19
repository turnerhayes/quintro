/* global Promise */

import { fromJS } from "immutable";

import {
	checkGameName,
	checkedGameName,
	createGame,
	gameCreated,
	GAME_CREATED,
} from "@app/actions";
import { runSaga } from "@app/utils/test-utils";


describe("CreateGame saga", () => {
	it("should check name against the server", async () => {
		// eslint-disable-next-line no-magic-numbers
		expect.assertions(2);

		jest.resetModules();

		const apiModule = await import("@app/api/games");

		let checkNamePromise;

		jest.spyOn(apiModule, "checkName").mockImplementation(
			() => {
				checkNamePromise = Promise.resolve(false);

				return checkNamePromise;
			}
		);

		const {
			dispatchers,
			dispatched,
		} = await runSaga({
			getSaga: async () => {
				const module = await import("./saga");

				return module.default;
			},
		});

		const name = "test";

		dispatchers.forEach((dispatcher) => dispatcher(checkGameName({ name })));

		await checkNamePromise;

		expect(apiModule.checkName).toHaveBeenCalledWith({ name });

		expect(dispatched).toEqual([ checkedGameName({ result: false }) ]);
	});

	it("should create a game on the server", async () => {
		// eslint-disable-next-line no-magic-numbers
		expect.assertions(2);

		jest.resetModules();

		const apiModule = await import("@app/api/games");

		let createGamePromise;

		const gameSpec = {
			name: "test",
			width: 10,
			height: 10,
			playerLimit: 3,
		};

		const game = fromJS({
			name: gameSpec.name,
			board: {
				width: gameSpec.width,
				height: gameSpec.height,
			},
			playerLimit: gameSpec.playerLimit,
		});

		jest.spyOn(apiModule, "createGame").mockImplementation(
			() => {
				createGamePromise = Promise.resolve(game);

				return createGamePromise;
			}
		);

		const {
			dispatchers,
			dispatched,
		} = await runSaga({
			getSaga: async () => {
				const module = await import("./saga");

				return module.default;
			},
		});

		dispatchers.forEach((dispatcher) => dispatcher(createGame(gameSpec)));

		await createGamePromise;

		expect(apiModule.createGame).toHaveBeenCalledWith(gameSpec);

		expect(dispatched.find((action) => action.type === GAME_CREATED)).toEqual(gameCreated({ game }));
	});

	it("should handle an error in creating a game", async () => {
		// eslint-disable-next-line no-magic-numbers
		expect.assertions(2);

		jest.resetModules();

		const apiModule = await import("@app/api/games");

		let createGamePromise;

		const gameSpec = {
			name: "test",
			width: 10,
			height: 10,
			playerLimit: 3,
		};

		const error = new Error("test error");

		jest.spyOn(apiModule, "createGame").mockImplementation(
			() => {
				createGamePromise = Promise.reject(error);

				return createGamePromise;
			}
		);

		jest.spyOn(console, "error").mockImplementation(() => {});

		const {
			dispatchers,
		} = await runSaga({
			getSaga: async () => {
				const module = await import("./saga");

				return module.default;
			},
		});

		dispatchers.forEach((dispatcher) => dispatcher(createGame(gameSpec)));

		try {
			await createGamePromise;
		}
		catch(ex) {
			expect(apiModule.createGame).toHaveBeenCalledWith(gameSpec);

			// eslint-disable-next-line no-console
			expect(console.error).toHaveBeenCalledWith(error);
		}
	});
});
