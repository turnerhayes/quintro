import { fromJS } from "immutable";
import * as immutableMatchers from "jest-immutable-matchers";

import {
	fetchedUserGames,
	fetchedGame,
	addPlayers,
	updateUserProfile,
} from "@app/actions";

import reducer from "./users";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("users reducer", () => {
	it("FETCHED_USER_GAMES", () => {
		const player1 = fromJS({
			color: "red",
			user: {
				id: "1",
				name: {
					display: "Tester One",
				},
				isMe: true,
			},
			order: 0,
		});

		const player2 = fromJS({
			color: "blue",
			user: {
				id: "2",
				name: {
					display: "Tester Two",
				},
			},
			order: 1,
		});

		const game1 = fromJS({
			name: "Testgame1",
			board: {
				width: 10,
				height: 10,
			},
			playerLimit: 3,
			players: [
				player1,
			],
		});

		const game2 = fromJS({
			name: "Testgame2",
			board: {
				width: 10,
				height: 10,
			},
			playerLimit: 3,
			players: [
				player1,
				player2,
			],
		});

		const state = reducer(undefined, fetchedUserGames({
			games: [
				game1,
				game2,
			]
		}));

		expect(state.get("items")).toEqualImmutable(fromJS({
			[player1.getIn([ "user", "id" ])]: player1.get("user"),
			[player2.getIn([ "user", "id" ])]: player2.get("user"),
		}));
	});

	it("FETCHED_GAME", () => {
		const player1 = fromJS({
			color: "red",
			user: {
				id: "1",
				name: {
					display: "Tester One",
				},
				isMe: true,
			},
			order: 0,
		});

		const player2 = fromJS({
			color: "blue",
			user: {
				id: "2",
				name: {
					display: "Tester Two",
				},
			},
			order: 1,
		});

		const game1 = fromJS({
			name: "Testgame1",
			board: {
				width: 10,
				height: 10,
			},
			playerLimit: 3,
			players: [
				player1,
			],
		});

		let state = reducer(undefined, fetchedGame({
			game: game1,
		}));

		expect(state.get("items")).toEqualImmutable(fromJS({
			[player1.getIn([ "user", "id" ])]: player1.get("user"),
		}));

		const game2 = fromJS({
			name: "Testgame2",
			board: {
				width: 10,
				height: 10,
			},
			playerLimit: 3,
			players: [
				player1,
				player2,
			],
		});

		state = reducer(state, fetchedGame({
			game: game2,
		}));

		expect(state.get("items")).toEqualImmutable(fromJS({
			[player1.getIn([ "user", "id" ])]: player1.get("user"),
			[player2.getIn([ "user", "id" ])]: player2.get("user"),
		}));
	});

	it("ADD_PLAYERS", () => {
		const player1 = fromJS({
			color: "red",
			user: {
				id: "1",
				name: {
					display: "Tester One",
				},
				isMe: true,
			},
			order: 0,
		});

		const player2 = fromJS({
			color: "blue",
			user: {
				id: "2",
				name: {
					display: "Tester Two",
				},
			},
			order: 1,
		});

		const game = fromJS({
			name: "Testgame1",
			board: {
				width: 10,
				height: 10,
			},
			playerLimit: 3,
			players: [
				player1,
			],
		});

		let state = reducer(undefined, fetchedGame({
			game,
		}));

		expect(state.get("items")).toEqualImmutable(fromJS({
			[player1.getIn([ "user", "id" ])]: player1.get("user"),
		}));

		state = reducer(state, addPlayers({
			gameName: game.get("name"),
			players: [
				player2,
			],
		}));

		expect(state.get("items")).toEqualImmutable(fromJS({
			[player1.getIn([ "user", "id" ])]: player1.get("user"),
			[player2.getIn([ "user", "id" ])]: player2.get("user"),
		}));
	});

	it("UPDATE_USER_PROFILE", () => {
		const player = fromJS({
			color: "red",
			user: {
				id: "1",
				name: {
					display: "Tester One",
				},
				isMe: true,
			},
			order: 0,
		});

		const game = fromJS({
			name: "Testgame1",
			board: {
				width: 10,
				height: 10,
			},
			playerLimit: 3,
			players: [
				player,
			],
		});

		let state = reducer(undefined, fetchedGame({
			game,
		}));

		expect(state.get("items")).toEqualImmutable(fromJS({
			[player.getIn([ "user", "id" ])]: player.get("user"),
		}));

		const user = player.get("user");

		const newDisplayName = "Fancy Tester";

		state = reducer(state, updateUserProfile({
			user: user.setIn([ "name", "display" ], newDisplayName).toJS(),
		}));

		expect(state.getIn([ "items", user.get("id"), "name", "display" ])).toBe(newDisplayName);
	});
});
