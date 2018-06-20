/* global Promise */

import { fromJS, List } from "immutable";
import { push } from "connected-react-router";

import createReducer from "@app/reducers";
import {
	fetchedGame,
	changeSetting,
	setCurrentPlayer,
	setMarble,
	getGame,
	leaveGame,
	addPlayer,
} from "@app/actions";

import { runSaga } from "@app/utils/test-utils";

describe("PlayGame saga", () => {
	const reducer = createReducer();

	const gameName = "test";

	const player1Color = "blue";
	const player2Color = "red";

	const player1 = fromJS({
		color: player1Color,
		user: {
			id: "1",
			isMe: true,
			name: {
				display: "Player One",
			},
		},
	});

	const game = fromJS({
		name: gameName,
		board: {
			width: 10,
			height: 10,
			filled: [],
		},
		playerLimit: 3,
		isStarted: true,
		currentPlayerColor: player2Color,
		players: [
			player1,
			{
				color: player2Color,
				user: {
					id: "2",
					isMe: false,
					name: {
						display: "Player Two",
					},
				},
			},
		],
	});

	const baseState = [
		fetchedGame({ game }),
	].reduce(reducer, undefined);

	describe("turn notification", () => {
		it("should display a notification if notifications enabled", async () => {
			expect.assertions(1);

			jest.resetModules();

			let show;

			const notificationPromise = new Promise(
				(resolve) => {
					show = jest.fn().mockImplementation(() => resolve());
				}
			);

			jest.doMock(
				"notifyjs",
				() => {
					class Notify {
						static needsPermission = true

						static requestPermission = (resolve) => resolve()

						show = show
					}

					return Notify;
				}
			);

			const state = [
				changeSetting({
					enableNotifications: true,
				})
			].reduce(reducer, baseState);
			
			const { dispatchers } = await runSaga({
				state,
				getSaga: async () => {
					const module = await import ("./saga");

					return module.default;
				},
			});

			const action = setCurrentPlayer({
				gameName,
				color: player1Color,
			});

			dispatchers.forEach((dispatcher) => dispatcher(action));

			await notificationPromise;

			expect(show).toHaveBeenCalledWith();
		});


		it("should not display a notification if changing to another player", async () => {
			expect.assertions(1);

			jest.resetModules();

			let show = jest.fn();

			jest.doMock(
				"notifyjs",
				() => {
					class Notify {
						static needsPermission = true

						static requestPermission = (resolve) => resolve()

						show = show
					}

					return Notify;
				}
			);

			const state = [
				changeSetting({
					enableNotifications: true,
				}),
			].reduce(reducer, baseState);

			const action = setCurrentPlayer({
				gameName,
				color: player2Color,
			});
			
			const { sagaPromise } = await runSaga(
				{
					state,
					getSaga: async () => {
						const module = await import ("./saga");

						return module.setCurrentPlayerSaga;
					},
				},
				action
			);

			await sagaPromise;

			expect(show).not.toHaveBeenCalled();
		});

		it("should not display a notification if notifications disabled", async () => {
			expect.assertions(1);

			jest.resetModules();

			let show = jest.fn();

			jest.doMock(
				"notifyjs",
				() => {
					class Notify {
						static needsPermission = true

						static requestPermission = (resolve) => resolve()

						show = show
					}

					return Notify;
				}
			);

			const action = setCurrentPlayer({
				gameName,
				color: player1Color,
			});

			const state = [
				// Make sure isMe player is the active one
				action,
				changeSetting({
					enableNotifications: false,
				})
			].reduce(reducer, baseState);

			const { sagaPromise } = await runSaga(
				{
					state,
					getSaga: async () => {
						const module = await import ("./saga");

						return module.setCurrentPlayerSaga;
					},
				},
				action
			);

			await sagaPromise;

			expect(show).not.toHaveBeenCalled();
		});

		it("should focus the window and dismiss the notification on click", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			jest.resetModules();

			const show = jest.fn();

			const close = jest.fn();

			let clickNotification;

			jest.spyOn(window, "focus").mockImplementation(() => {});

			jest.doMock(
				"notifyjs",
				() => {
					class Notify {
						constructor(title, options) {
							clickNotification = () => options.notifyClick();
						}

						static needsPermission = false

						show = show

						close = close
					}

					return Notify;
				}
			);

			const action = setCurrentPlayer({
				gameName,
				color: player1Color,
			});

			const state = [
				action,
				changeSetting({
					enableNotifications: true,
				})
			].reduce(reducer, baseState);

			const { sagaPromise } = await runSaga(
				{
					state,
					getSaga: async () => {
						const module = await import ("./saga");

						return module.setCurrentPlayerSaga;
					},
				},
				action
			);

			await sagaPromise;

			clickNotification();

			expect(window.focus).toHaveBeenCalledWith();

			expect(close).toHaveBeenCalledWith();
		});
	});

	describe("sound effects", () => {
		it("should play a sound if the setting is enabled", async () => {
			expect.assertions(1);

			jest.resetModules();

			const state = [
				changeSetting({
					enableSoundEffects: true,
				})
			].reduce(reducer, baseState);

			const play = jest.fn();

			const playPromise = new Promise(
				(resolve) => {
					jest.doMock("howler", () => {
						class MockHowler {
							stop() {}

							play() {
								play(...arguments);
								resolve();
							}

							fade() {}
						}

						return {
							Howl: MockHowler,
						};
					});
				}
			);
			
			const { dispatchers } = await runSaga({
				state,
				getSaga: async () => {
					const module = await import ("./saga");

					return module.default;
				},
			});

			const action = setMarble({
				gameName,
				position: List([ 0, 1 ]),
				color: player1Color,
			});

			dispatchers.forEach((dispatcher) => dispatcher(action));

			await playPromise;

			expect(play).toHaveBeenCalledWith();
		});

		it("should not play a sound if the setting is disabled", async () => {
			expect.assertions(1);

			jest.resetModules();

			const state = [
				changeSetting({
					enableSoundEffects: false,
				})
			].reduce(reducer, baseState);

			const play = jest.fn();

			jest.doMock("howler", () => {
				class MockHowler {
					stop() {}

					play = play

					fade() {}
				}

				return {
					Howl: MockHowler,
				};
			});
			
			const { dispatchers, sagaPromise } = await runSaga({
				state,
				getSaga: async () => {
					const module = await import ("./saga");

					return module.setMarbleSaga;
				},
			});

			const action = setMarble({
				gameName,
				position: List([ 0, 1 ]),
				color: player1Color,
			});

			dispatchers.forEach((dispatcher) => dispatcher(action));

			await sagaPromise;

			expect(play).not.toHaveBeenCalled();
		});
	});

	describe("get game", () => {
		it("should fetch a game when a getGame action is dispatched", async () => {
			expect.assertions(1);

			jest.resetModules();

			const gameName = "test2";

			const game = fromJS({
				name: gameName,
				board: {
					width: 10,
					height: 10,
					filled: [],
				},
				playerLimit: 3,
				players: [
				],
			});

			const getGameMock = jest.fn().mockResolvedValue(game);

			jest.doMock("@app/api/games", () => {
				return {
					getGame: getGameMock,
				};
			});

			const { sagaPromise } = await runSaga(
				{
					state: baseState,
					getSaga: async () => {
						const module = await import ("./saga");

						return module.getGameSaga;
					},
				},
				getGame({
					name: gameName,
				})
			);

			await sagaPromise;

			expect(getGameMock).toHaveBeenCalledWith({ name: gameName });
		});
	});

	describe("leave all games on navigation", () => {
		it("should leave the games when the page is changed", async () => {
			expect.assertions(1);

			jest.resetModules();

			const otherGameName = "othergame";

			const otherGame = fromJS({
				name: otherGameName,
				board: {
					width: 10,
					height: 10,
					filled: [],
				},
				playerLimit: 3,
				players: [
					player1,
				],
			});

			const state = [
				fetchedGame({ game: otherGame }),
				addPlayer({
					gameName,
					player: player1.toJS(),
				}),
				addPlayer({
					gameName: otherGameName,
					player: player1.toJS(),
				}),
			].reduce(reducer, baseState);

			const { sagaPromise, dispatched } = await runSaga(
				{
					state,
					getSaga: async () => {
						const module = await import ("./saga");

						return module.locationChangeSaga;
					},
				},
				push("http://example.com")
			);

			await sagaPromise;

			expect(dispatched).toEqual([
				leaveGame({ gameName }),
				leaveGame({ gameName: otherGameName }),
			]);
		});
	});
});
