import { fromJS } from "immutable";
import { take, put, call } from "redux-saga/effects";

import * as actions from "@app/actions";
import createReducer from "@app/reducers";
import { runSaga } from "@app/utils/test-utils";
import createChannel from "@app/sagas/client-channel";
import GameClient from "@app/api/game-client";

describe("games socket saga", () => {
	describe("fetchedGameSaga", () => {
		it("should call updateGame()", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const gameName = "test";

			const game = fromJS({
				name: gameName,
				board: {
					width: 10,
					height: 10,
				},
				playerLimit: 3,
				players: [],
			});

			jest.resetModules();

			const updateGameStub = jest.fn().mockName("mock-updateGame");

			jest.doMock("@app/api/game-client", () => {
				class MockGamesSocket {
					updateGame = updateGameStub
				}

				return MockGamesSocket;
			});

			const module = await import("./games-socket");

			const saga = module.fetchedGameSaga;

			const gen = saga(actions.fetchedGame({
				game,
			}));

			expect(gen.next().value).toEqual(call(updateGameStub, { gameName }));

			expect(gen.next().done).toBeTruthy();
		});
	});

	describe("placeMarbleSaga", () => {
		it("should call placeMarble()", async () => {
			expect.assertions(1);

			const reducer = createReducer();

			const gameName = "test";

			const game = fromJS({
				name: gameName,
				board: {
					width: 10,
					height: 10,
				},
				playerLimit: 3,
				players: [],
			});

			const state = reducer(undefined, actions.fetchedGame({
				game,
			}));

			jest.resetModules();

			const placeMarbleStub = jest.fn().mockName("mock-placeMarble");

			jest.doMock("@app/api/game-client", () => {
				class MockGamesSocket {
					placeMarble = placeMarbleStub
				}

				return MockGamesSocket;
			});

			// eslint-disable-next-line no-magic-numbers
			const position = [1, 2];

			const { sagaPromise } = await runSaga(
				{
					state,
					async getSaga() {
						const module = await import("./games-socket");

						return module.placeMarbleSaga;
					}
				},
				actions.placeMarble({
					gameName,
					position,
				})
			);

			await sagaPromise;

			expect(placeMarbleStub).toHaveBeenCalledWith({
				gameName,
				position,
			});
		});
	});

	[
		"updateGame",
		"watchGame",
		"joinGame",
		"leaveGame",
		"startGame",
	].forEach(
		(method) => {
			describe(`${method}Saga`, () => {
				it(`should call ${method}()`, async () => {
					// eslint-disable-next-line no-magic-numbers
					expect.assertions(2);

					const gameName = "test";

					jest.resetModules();

					const methodStub = jest.fn().mockName(`mock-${method}`);

					jest.doMock("@app/api/game-client", () => {
						class MockGamesSocket {
						}

						MockGamesSocket.prototype[method] = methodStub;

						return MockGamesSocket;
					});

					const module = await import("./games-socket");

					const saga = module[`${method}Saga`];

					const gen = saga(actions[method]({
						gameName,
					}));
					
					expect(gen.next().value).toEqual(call(methodStub, {
						gameName
					}));

					expect(gen.next().done).toBeTruthy();
				});
			});
		}
	);

	describe("watchGameSocket", () => {
		it("should take from the game socket channel", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			jest.resetModules();

			const gameName = "test";

			const channel = createChannel(GameClient);

			const sagaModule = await import("./games-socket");

			const saga = sagaModule.watchGameSocket;

			const gen = saga(channel);

			let effect = gen.next();

			expect(effect.value).toEqual(take(channel));

			const action = actions.gameStarted({
				gameName,
			});

			effect = gen.next(action);

			expect(effect.value).toEqual(put(action));
		});
	});
});
