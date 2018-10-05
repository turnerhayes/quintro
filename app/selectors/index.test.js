import { fromJS, Set } from "immutable";
import * as immutableMatchers from "jest-immutable-matchers";
import selectors from "./index";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("selectors (root)", () => {
	describe("games", () => {
		describe("getPlayerUsers", () => {
			const gameName = "test";

			const user1 = fromJS({
				id: "12345",
			});

			const user2 = fromJS({
				id: "6789",
			});

			const state = fromJS({
				games: {
					items: {
						[gameName]: {
							name: gameName,
							board: {
								width: 10,
								height: 10,
								filledCells: [],
							},
							playerLimit: 3,
							players: [
								{
									color: "blue",
									userID: user1.get("id"),
								},
								{
									color: "red",
									userID: user2.get("id"),
								}
							]
						},
					},
				},
				users: {
					items: {
						[user1.get("id")]: user1,
						[user2.get("id")]: user2,
					}
				}
			});

			it("should return a map of users", () => {
				const users = selectors.games.getPlayerUsers(state, { gameName });

				expect(users).toBeImmutable(fromJS({
					[user1.get("id")]: user1,
					[user2.get("id")]: user2,
				}));
			});
		});

		describe("getCurrentUserPlayers", () => {
			const gameName = "test";

			const user1 = fromJS({
				id: "12345",
				isMe: true,
			});

			const user2 = fromJS({
				id: "6789",
			});

			const player1 = fromJS({
				color: "blue",
				userID: user1.get("id"),
			});

			const state = fromJS({
				games: {
					items: {
						[gameName]: {
							name: gameName,
							board: {
								width: 10,
								height: 10,
								filledCells: [],
							},
							playerLimit: 3,
							players: [
								player1,
								{
									color: "red",
									userID: user2.get("id"),
								}
							]
						},
					},
				},
				users: {
					items: {
						[user1.get("id")]: user1,
						[user2.get("id")]: user2,
					}
				}
			});

			it("should return the correct players", () => {
				const players = selectors.games.getCurrentUserPlayers(state, { gameName });

				expect(players).toEqualImmutable(Set.of(player1));
			});
		});
	});
});
