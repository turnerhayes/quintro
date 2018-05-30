/* global Promise */

import { SocketIO, Server } from "mock-socket";

import Config from "@app/config";
import {
	updateWatchers,
	gameStarted,
	gameUpdated,
	setWinner,
	setMarble,
	addPlayer,
	setPlayerPresence,
	setCurrentPlayer,
	setGamePlayError,
} from "@app/actions";


describe("Game client API", () => {
	jest.doMock("socket.io-client", () => SocketIO);

	let server = null;

	let connectPromise = null;

	let GameClient;

	const dispatch = jest.fn().mockName("mock-clientDispatch");

	let client = null;

	beforeEach(async () => {
		server = new Server(Config.websockets.url);

		connectPromise = new Promise(
			(resolve) => server.on("connection", resolve)
		);

		jest.resetModules();

		dispatch.mockReset();

		const module = await import("./game-client");

		GameClient = module.default;

		client = new GameClient({
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
			new GameClient({});
		}).toThrow("Cannot construct a GameClient without a dispatch function");

		expect(() => {
			new GameClient({
				dispatch: "this is wrong",
			});
		}).toThrow("Cannot construct a GameClient without a dispatch function");
	});

	it("should clear handlers on dispose()", () => {
		jest.spyOn(client, "off");

		client.dispose();

		expect(client.off).toHaveBeenCalledWith(
			"board:marble:placed",
			client.onMarblePlaced
		);
		expect(client.off).toHaveBeenCalledWith(
			"game:currentPlayer:changed",
			client.onCurrentPlayerChanged
		);
		expect(client.off).toHaveBeenCalledWith(
			"game:player:joined",
			client.onPlayerJoined
		);
		expect(client.off).toHaveBeenCalledWith(
			"game:player:left",
			client.onPlayerLeft
		);
		expect(client.off).toHaveBeenCalledWith(
			"game:watchers:updated",
			client.onWatchersUpdated
		);
		expect(client.off).toHaveBeenCalledWith(
			"game:started",
			client.onGameStarted
		);
		expect(client.off).toHaveBeenCalledWith(
			"game:over",
			client.onGameOver
		);
	});

	describe("action dispatches", () => {
		it("should dispatch an updateWatchers action on a game:watchers:updated socket message", async () => {
			expect.assertions(1);

			await connectPromise;

			const gameName = "test";

			const watchers = {
				count: 3,
			};

			server.emit("game:watchers:updated", { gameName, watchers });

			expect(dispatch).toHaveBeenCalledWith(updateWatchers({
				gameName,
				watchers,
			}));
		});

		it("should dispatch a gameStarted action on a game:started socket message", async () => {
			expect.assertions(1);

			await connectPromise;

			const gameName = "test";

			server.emit("game:started", { gameName });

			expect(dispatch).toHaveBeenCalledWith(gameStarted({
				gameName,
			}));
		});

		it("should dispatch a setWinner action on a game:over socket message", async () => {
			expect.assertions(1);

			await connectPromise;

			const gameName = "test";

			const winner = {
				color: "blue",
			};

			server.emit("game:over", { gameName, winner });

			expect(dispatch).toHaveBeenCalledWith(setWinner({
				gameName,
				color: winner.color,
			}));
		});

		it("should dispatch a setMarble action on a board:marble:placed socket message", async () => {
			expect.assertions(1);

			await connectPromise;

			const gameName = "test";

			const color = "blue";

			const position = [ 1, 1 ];

			server.emit("board:marble:placed", { gameName, color, position });

			expect(dispatch).toHaveBeenCalledWith(setMarble({
				gameName,
				color,
				position,
			}));
		});

		it("should dispatch addPlayer and setPlayerPresence actions on a game:player:joined socket message", async () => {
			expect.assertions(1);

			await connectPromise;

			const gameName = "test";

			const player = {
				color: "blue",
				user: {},
			};

			server.emit("game:player:joined", { gameName, player });

			expect(dispatch.mock.calls).toEqual([
				[
					addPlayer({
						gameName,
						player,
					}),
				],
				[
					setPlayerPresence({
						gameName,
						presenceMap: {
							[player.color]: true,
						},
					}),
				],
			]);
		});

		it("should dispatch an setPlayerPresence action on a game:player:left socket message", async () => {
			expect.assertions(1);

			await connectPromise;

			const gameName = "test";

			const player = {
				color: "blue",
				user: {},
			};

			server.emit("game:player:left", { gameName, player });

			expect(dispatch).toHaveBeenCalledWith(setPlayerPresence({
				gameName,
				presenceMap: {
					[player.color]: false,
				},
			}));
		});

		it("should dispatch an setCurrentPlayer action on a game:currentPlayer:changed socket message", async () => {
			expect.assertions(1);

			await connectPromise;

			const gameName = "test";

			const color = "blue";

			server.emit("game:currentPlayer:changed", { gameName, color });

			expect(dispatch).toHaveBeenCalledWith(setCurrentPlayer({
				gameName,
				color
			}));
		});

		it("should dispatch an setGamePlayError action on a from the setGamePlayError() function", async () => {
			expect.assertions(1);

			const gameName = "test";

			const error = new Error("Test error");

			client.setGamePlayError({ gameName, error });

			expect(dispatch).toHaveBeenCalledWith(setGamePlayError({
				gameName,
				error
			}));
		});
	});

	describe("websocket emits", () => {
		it("should emit a game:join message to the server from joinGame()", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(3);

			const gameName = "test";

			const color = "blue";

			const player = {
				color,
				user: {
					id: "1",
					name: {
						display: "Test Tester",
					},
				},
			};

			await connectPromise;

			let messageData;

			server.on("game:update", (data, callback) => {
				expect(data).toEqual({ gameName });
				callback({
					update: {},
				});
			});

			const joinMessagePromise = new Promise(
				(resolve) => {
					server.on("game:join", (data, callback) => {
						messageData = data;

						callback({
							player,
							currentPlayerColor: color,
						});
						resolve();
					});
				}
			);

			const joinGamePromise = client.joinGame({
				gameName,
				color,
			});

			await joinMessagePromise;

			expect(messageData).toEqual({
				gameName,
				color,
			});

			await joinGamePromise;

			expect(dispatch.mock.calls).toEqual(
				[
					[
						addPlayer({
							gameName,
							player,
						}),
					],
					[
						setPlayerPresence({
							gameName,
							presenceMap: {
								[color]: true,
							},
						}),
					],
					[
						setCurrentPlayer({
							gameName,
							color,
						}),
					],
					[
						gameUpdated({
							gameName,
							update: {},
						}),
					],
				]
			);
		});

		it("should emit a game:leave message to the server from leaveGame()", async () => {
			expect.assertions(1);

			const gameName = "test";

			await connectPromise;

			let messageData;

			const leaveMessagePromise = new Promise(
				(resolve) => {
					server.on("game:leave", (data) => {
						messageData = data;

						resolve();
					});
				}
			);

			client.leaveGame({
				gameName,
			});

			await leaveMessagePromise;

			expect(messageData).toEqual({
				gameName,
			});
		});

		it("should emit a game:watch message to the server from watchGame()", async () => {
			expect.assertions(1);

			const gameName = "test";

			await connectPromise;

			let messageData;

			const watchMessagePromise = new Promise(
				(resolve) => {
					server.on("game:watch", (data) => {
						messageData = data;

						resolve();
					});
				}
			);

			client.watchGame({
				gameName,
			});

			await watchMessagePromise;

			expect(messageData).toEqual({
				gameName,
			});
		});

		it("should emit a game:start message to the server from startGame()", async () => {
			expect.assertions(1);

			const gameName = "test";

			await connectPromise;

			let messageData;

			const startMessagePromise = new Promise(
				(resolve) => {
					server.on("game:start", (data) => {
						messageData = data;

						resolve();
					});
				}
			);

			client.startGame({
				gameName,
			});

			await startMessagePromise;

			expect(messageData).toEqual({
				gameName,
			});
		});

		it("should emit a game:update message to the server from updateGame()", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const gameName = "test";

			await connectPromise;

			const update = {
				playerPresence: {
					blue: true,
					red: false,
				},
				watchers: {
					count: 4,
				},
			};

			let messageData;

			const updateMessagePromise = new Promise(
				(resolve) => {
					server.on("game:update", (data, callback) => {
						messageData = data;

						resolve();

						callback({
							update,
						});
					});
				}
			);

			const updateGamePromise = client.updateGame({
				gameName,
			});

			await updateMessagePromise;

			expect(messageData).toEqual({
				gameName,
			});

			await updateGamePromise;

			expect(dispatch).toHaveBeenCalledWith(gameUpdated({
				gameName,
				update,
			}));
		});

		it("should emit a board:place-marble message to the server from placeMarble()", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(3);

			const gameName = "test";

			// eslint-disable-next-line no-magic-numbers
			const position = [ 3, 5 ];

			const error = new Error("Test placement error");

			await connectPromise;

			let messageData;

			const placeMarbleMessagePromise = new Promise(
				(resolve) => {
					server.on("board:place-marble", (data, callback) => {
						messageData = data;

						resolve();

						callback({
							error,
						});
					});
				}
			);

			const placeMarblePromise = client.placeMarble({
				gameName,
				position,
			});

			await placeMarbleMessagePromise;

			expect(messageData).toEqual({
				gameName,
				position,
			});

			await placeMarblePromise;

			expect(dispatch).toHaveBeenCalledWith(setGamePlayError({
				gameName,
				error: null,
			}));

			expect(dispatch).toHaveBeenCalledWith(setGamePlayError({
				gameName,
				// Can't expect on the exact error because SocketClient class
				// wraps it in another Error object
				error: expect.anything(),
			}));
		});

		it("should emit a game:players:presence message to the server from updatePlayerPresence()", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const gameName = "test";

			await connectPromise;

			const presentPlayers = [
				{
					color: "blue",
					user: {
						id: "1",
					},
				},
			];

			const presenceMap = {
				blue: true,
			};

			let messageData;

			const updatePlayerPresenceMessagePromise = new Promise(
				(resolve) => {
					server.on("game:players:presence", (data, callback) => {
						messageData = data;

						resolve();

						callback({
							presentPlayers,
						});
					});
				}
			);

			const updatePlayerPresencePromise = client.updatePlayerPresence({
				gameName,
			});

			await updatePlayerPresenceMessagePromise;

			expect(messageData).toEqual({
				gameName,
			});

			await updatePlayerPresencePromise;

			expect(dispatch).toHaveBeenCalledWith(setPlayerPresence({
				gameName,
				presenceMap,
				setMissingPlayersTo: false,
			}));
		});
	});
});
