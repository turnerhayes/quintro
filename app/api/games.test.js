import { fromJS } from "immutable";
import fetchMock from "fetch-mock";
import * as immutableMatchers from "jest-immutable-matchers";
import { URLSearchParams } from "url";
import { OK, NOT_FOUND } from "http-status-codes";

import {
	getGame,
	findOpenGames,
	getUserGames,
	checkName,
	createGame,
} from "./games";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

afterEach(() => {
	fetchMock.restore();
});

describe("Games API", () => {
	describe("getGame", () => {
		it("should return a game object", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const uriRegex = /\/api\/games\/(\w+)/;

			const gameName = "123";

			let receivedGameName;

			const game = {
				name: gameName,
				board: {
					width: 15,
					height: 15,
				},
				playerLimit: 4,
				players: [],
			};

			fetchMock.get(uriRegex, (url) => {
				const matches = uriRegex.exec(url);

				receivedGameName = matches[1];

				return {
					...game,
					name: receivedGameName,
				};
			});

			const returnedGame = await getGame({ name: gameName });

			expect(receivedGameName).toBe(gameName);

			expect(returnedGame).toEqualImmutable(fromJS(game));
		});

		it("should reject on error", () => {
			const error = "Test error";

			fetchMock.get(/\/api\/games\/\w+/, () => {
				return {
					status: 500,
					body: {
						error: {
							message: error,
						},
					},
				};
			});

			const gamePromise = getGame({ name: "123" });

			expect(gamePromise).rejects.toThrow(new Error(error));
		});
	});

	describe("findOpenGames", () => {
		it("should return game objects with the specified player count", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const uriRegex = /\/api\/games\?(.*)/;

			const expectedNumberOfPlayers = 4;

			let receivedNumberOfPlayers;

			const games = [
				{
					name: "game1",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "blue",
							user: {
								id: "1",
							},
						},
						{
							color: "red",
							user: {
								id: "2",
							},
						},
						{
							color: "yellow",
							user: {
								id: "3",
							},
						},
						{
							color: "green",
							user: {
								id: "4",
							},
						},
					],
				},
				{
					name: "game2",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "green",
							user: {
								id: "1",
							},
						},
						{
							color: "blue",
							user: {
								id: "2",
							},
						},
						{
							color: "red",
							user: {
								id: "3",
							},
						},
						{
							color: "yellow",
							user: {
								id: "4",
							},
						},
					],
				},
				{
					name: "game3",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "red",
							user: {
								id: "1",
							},
						},
						{
							color: "green",
							user: {
								id: "2",
							},
						},
						{
							color: "yellow",
							user: {
								id: "3",
							},
						},
						{
							color: "blue",
							user: {
								id: "4",
							},
						},
					],
				},
				{
					name: "game4",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "green",
							user: {
								id: "1",
							},
						},
						{
							color: "yellow",
							user: {
								id: "2",
							},
						},
						{
							color: "blue",
							user: {
								id: "3",
							},
						},
						{
							color: "red",
							user: {
								id: "4",
							},
						},
					],
				},
			];

			fetchMock.get(uriRegex, (url) => {
				const matches = uriRegex.exec(url);

				const params = new URLSearchParams(matches[1]);

				receivedNumberOfPlayers = Number(params.get("numberOfPlayers"));

				return games;
			});

			const returnedGames = await findOpenGames({
				numberOfPlayers: expectedNumberOfPlayers,
			});

			expect(receivedNumberOfPlayers).toBe(expectedNumberOfPlayers);

			expect(returnedGames).toEqualImmutable(fromJS(games));
		});

		it("should return game objects with no player count", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const uriRegex = /\/api\/games\?(.*)/;

			let receivedNumberOfPlayers;

			const games = [
				{
					name: "game1",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "blue",
							user: {
								id: "1",
							},
						},
						{
							color: "red",
							user: {
								id: "2",
							},
						},
						{
							color: "yellow",
							user: {
								id: "3",
							},
						},
						{
							color: "green",
							user: {
								id: "4",
							},
						},
					],
				},
				{
					name: "game2",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "green",
							user: {
								id: "1",
							},
						},
						{
							color: "blue",
							user: {
								id: "2",
							},
						},
						{
							color: "red",
							user: {
								id: "3",
							},
						},
						{
							color: "yellow",
							user: {
								id: "4",
							},
						},
					],
				},
				{
					name: "game3",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "red",
							user: {
								id: "1",
							},
						},
						{
							color: "green",
							user: {
								id: "2",
							},
						},
						{
							color: "yellow",
							user: {
								id: "3",
							},
						},
						{
							color: "blue",
							user: {
								id: "4",
							},
						},
					],
				},
				{
					name: "game4",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "green",
							user: {
								id: "1",
							},
						},
						{
							color: "yellow",
							user: {
								id: "2",
							},
						},
						{
							color: "blue",
							user: {
								id: "3",
							},
						},
						{
							color: "red",
							user: {
								id: "4",
							},
						},
					],
				},
			];

			fetchMock.get(uriRegex, (url) => {
				const matches = uriRegex.exec(url);

				const params = new URLSearchParams(matches[1]);

				receivedNumberOfPlayers = params.get("numberOfPlayers");

				return games;
			});

			const returnedGames = await findOpenGames();

			expect(receivedNumberOfPlayers).toBe(null);

			expect(returnedGames).toEqualImmutable(fromJS(games));
		});

		it("should reject on error", () => {
			const error = "Test error";

			fetchMock.get(/\/api\/games\?.*/, () => {
				return {
					status: 500,
					body: {
						error: {
							message: error,
						},
					},
				};
			});

			const gamesPromise = findOpenGames({ numberOfPlayers: 4 });

			expect(gamesPromise).rejects.toThrow(new Error(error));
		});
	});

	describe("getUserGames", () => {
		it("should return game objects", async () => {
			expect.assertions(1);

			const games = [
				{
					name: "game1",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "blue",
							user: {
								id: "1",
							},
						},
						{
							color: "red",
							user: {
								id: "2",
							},
						},
						{
							color: "yellow",
							user: {
								id: "3",
							},
						},
						{
							color: "green",
							user: {
								id: "4",
							},
						},
					],
				},
				{
					name: "game2",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "green",
							user: {
								id: "1",
							},
						},
						{
							color: "blue",
							user: {
								id: "2",
							},
						},
						{
							color: "red",
							user: {
								id: "3",
							},
						},
						{
							color: "yellow",
							user: {
								id: "4",
							},
						},
					],
				},
				{
					name: "game3",
					board: {
						width: 15,
						height: 15,
					},
					playerLimit: 5,
					players: [
						{
							color: "red",
							user: {
								id: "1",
							},
						},
						{
							color: "green",
							user: {
								id: "2",
							},
						},
						{
							color: "yellow",
							user: {
								id: "3",
							},
						},
						{
							color: "blue",
							user: {
								id: "4",
							},
						},
					],
				},
			];

			fetchMock.get("/api/games?includeUserGames=true", () => {
				return games;
			});

			const returnedGames = await getUserGames();

			expect(returnedGames).toEqualImmutable(fromJS(games));
		});

		it("should reject on error", () => {
			const error = "Test error";

			fetchMock.get("/api/games?includeUserGames=true", () => {
				return {
					status: 500,
					body: {
						error: {
							message: error,
						},
					},
				};
			});

			const gamesPromise = getUserGames();

			expect(gamesPromise).rejects.toThrow(new Error(error));
		});
	});

	describe("checkName", () => {
		it("should return true if the game already exists", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const uriRegex = /\/api\/games\/(\w+)/;

			const expectedGameName = "test";

			let receivedGameName;

			// eslint-disable-next-line no-magic-numbers
			fetchMock.head(uriRegex, (url) => {
				const matches = uriRegex.exec(url);

				receivedGameName = matches[1];

				return {
					status: OK,
				};
			});

			const nameExists = await checkName({ name: expectedGameName });

			expect(receivedGameName).toBe(expectedGameName);

			expect(nameExists).toBeTruthy();
		});

		it("should return false if the game does not already exist", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const uriRegex = /\/api\/games\/(\w+)/;

			const expectedGameName = "test";

			let receivedGameName;

			// eslint-disable-next-line no-magic-numbers
			fetchMock.head(uriRegex, (url) => {
				const matches = uriRegex.exec(url);

				receivedGameName = matches[1];

				return {
					status: NOT_FOUND,
				};
			});

			const nameExists = await checkName({ name: expectedGameName });

			expect(receivedGameName).toBe(expectedGameName);

			expect(nameExists).toBeFalsy();
		});

		it("should reject on error", () => {
			const error = "Test error";

			fetchMock.head(/\/api\/games\/\w+/, () => {
				return {
					status: 500,
					body: {
						error: {
							message: error,
						},
					},
				};
			});

			const checkPromise = checkName({ name: "test" });

			expect(checkPromise).rejects.toThrow();
		});
	});

	describe("createGame", () => {
		it("should return the created game", async () => {
			// eslint-disable-next-line no-magic-numbers
			expect.assertions(2);

			const gameData = {
				width: 20,
				height: 15,
				name: "test",
				playerLimit: 4,
			};

			let receivedGameData;

			fetchMock.post(`/api/games/${gameData.name}`, (url, options) => {
				receivedGameData = JSON.parse(options.body);

				return {
					name: receivedGameData.name,
					board: {
						width: receivedGameData.width,
						height: receivedGameData.height,
					},
					playerLimit: receivedGameData.playerLimit,
					players: [],
				};
			});

			const returnedGame = await createGame(gameData);

			expect(receivedGameData).toEqual(gameData);

			expect(returnedGame).toEqualImmutable(fromJS({
				name: gameData.name,
				board: {
					width: gameData.width,
					height: gameData.height,
				},
				playerLimit: gameData.playerLimit,
				players: [],
			}));
		});

		it("should reject on error", () => {
			const error = "Test error";

			const gameName = "test";

			fetchMock.post(`/api/games/${gameName}`, () => {
				return {
					status: 500,
					body: {
						error: {
							message: error,
						},
					},
				};
			});

			const gamePromise = createGame({
				width: 10,
				height: 10,
				name: gameName,
				playerLimit: 3,
			});

			expect(gamePromise).rejects.toThrow(new Error(error));
		});
	});
});
