import { fromJS } from "immutable";
import * as immutableMatchers from "jest-immutable-matchers";

import {
	fetchedUserGames,
	fetchedGame,
	findOpenGames,
	gameUpdated,
	addPlayer,
	updateWatchers,
	setPlayerPresence,
	leaveGame,
	setMarble,
	setCurrentPlayer,
	setWinner,
	gameStarted,
} from "@app/actions";

import reducer from "./games";

beforeAll(() => {
	jest.addMatchers(immutableMatchers);
});

describe("Games reducer", () => {
	const toStatePlayer = (player) => {
		player = fromJS(player);

		return player.delete("order")
			.set("userID", player.getIn([ "user", "id" ]))
			.delete("user");
	};

	it("FETCHED_USER_GAMES", () => {
		const name = "test";

		const game = fromJS({
			name,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [],
		});

		const state = reducer(undefined, fetchedUserGames({
			games: [ game ],
		}));

		expect(state.getIn([ "items", name ])).toEqualImmutable(
			game.set("isLoaded", true)
		);
	});

	it("FETCHED_GAME", () => {
		const name = "test";

		const game = fromJS({
			name,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [],
		});

		const state = reducer(undefined, fetchedGame({
			game,
		}));

		expect(state.getIn([ "items", name ])).toEqualImmutable(
			game.set("isLoaded", true)
		);
	});

	it("GAME_UPDATED", () => {
		const name = "test";

		const game = fromJS({
			name,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [],
		});

		const player1Color = "red";

		const update = {
			players: [
				{
					color: player1Color,
					user: {
						id: "1",
						isMe: true,
					},
				},
			],
		};

		const initialState = reducer(undefined, fetchedGame({
			game,
		}));

		const state = reducer(initialState, gameUpdated({
			gameName: name,
			update,
		}));

		expect(state.getIn([ "items", name ])).toEqualImmutable(
			game.set("isLoaded", true).merge(fromJS(update))
		);
		expect(state.getIn([ "items", name, "players", 0, "color" ])).toBe(player1Color);
	});

	it("ADD_PLAYER", () => {
		const gameName = "test";

		const game = fromJS({
			name: gameName,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [],
		});

		const player1 = {
			color: "red",
			user: {
				id: "1",
				name: {
					display: "Tester One",
				},
			},
			order: 0,
		};

		const initialState = reducer(undefined, fetchedGame({
			game,
		}));

		let state = reducer(initialState, addPlayer({
			gameName,
			player: player1,
		}));

		expect(state.getIn([ "items", gameName, "players" ])).toEqualImmutable(
			fromJS([
				toStatePlayer(player1),	
			])
		);

		const player2 = {
			color: "blue",
			user: {
				id: "2",
				name: {
					display: "Tester Two",
				},
				isMe: true,
			},
			order: 1,
		};

		state = reducer(state, addPlayer({
			gameName,
			player: player2,
		}));

		expect(state.getIn([ "items", gameName, "players" ])).toEqualImmutable(
			fromJS([
				toStatePlayer(player1),
				toStatePlayer(player2),
			])
		);

		expect(state.get("joinedGames").includes(gameName)).toBeTruthy();
	});

	it("UPDATE_WATCHERS", () => {
		const gameName = "test";

		const game = fromJS({
			name: gameName,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [],
		});

		const watcherCount = 3;

		const state = [
			fetchedGame({ game }),
			updateWatchers({
				gameName,
				watchers: {
					count: watcherCount,
				},
			}),
		].reduce(reducer, undefined);

		expect(state.getIn([ "items", gameName, "watchers", "count" ]))
			.toBe(watcherCount);
	});

	it("SET_PLAYER_PRESENCE", () => {
		const gameName = "test";

		const colors = [ "red", "green", "blue" ];

		// eslint-disable-next-line no-magic-numbers
		const players = [1, 2, 3].map(
			(id) => fromJS({
				color: colors[id - 1],
				user: {
					id: id + "",
					name: {
						display: `Player ${id}`,
					},
				},
			})
		);

		const game = fromJS({
			name: gameName,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players,
		});


		let state = reducer(undefined, fetchedGame({
			game,
		}));

		state = reducer(state, setPlayerPresence({
			gameName,
			presenceMap: fromJS({
				[colors[0]]: true,
				[colors[1]]: true,
				[colors[2]]: true,
			}),
		}));

		expect(state.getIn([ "items", gameName, "playerPresence" ])).toEqualImmutable(
			fromJS({
				[colors[0]]: true,
				[colors[1]]: true,
				[colors[2]]: true,	
			})
		);

		state = reducer(undefined, fetchedGame({
			game,
		}));

		state = reducer(state, setPlayerPresence({
			gameName,
			presenceMap: fromJS({
				[colors[0]]: true,
				[colors[2]]: true,
			}),
			setMissingPlayersTo: false,
		}));

		expect(state.getIn([ "items", gameName, "playerPresence" ])).toEqualImmutable(
			fromJS({
				[colors[0]]: true,
				[colors[1]]: false,
				[colors[2]]: true,	
			})
		);
	});

	it("LEAVE_GAME", () => {
		const name = "test";

		const game = fromJS({
			name,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [],
		});

		const player1 = {
			color: "blue",
			user: {
				id: "1",
				name: {
					display: "Tester 1",
				},
				isMe: true,
			},
			order: 0,
		};

		let state = [
			fetchedGame({
				game,
			}),
			addPlayer({
				gameName: name,
				player: player1,
			})
		].reduce(reducer, undefined);

		expect(state.get("joinedGames").includes(name)).toBeTruthy();

		state = reducer(state, leaveGame({
			gameName: name,
		}));

		expect(state.get("joinedGames").includes(name)).toBeFalsy();
	});

	it("SET_MARBLE", () => {
		const name = "test";

		const game = fromJS({
			name,
			board: {
				width: 10,
				height: 10,
			},
			playerLimit: 3,
			players: [],
		});

		const color = "blue";

		const player1 = fromJS({
			color,
			user: {
				id: "1",
				name: {
					display: "Tester 1",
				},
				isMe: true,
			},
			order: 0,
		});

		let state = [
			fetchedGame({
				game,
			}),
			addPlayer({
				gameName: name,
				player: player1,
			})
		].reduce(reducer, undefined);

		const position = [ 1, 0 ];

		state = reducer(state, setMarble({
			gameName: name,
			position,
			color,
		}));

		expect(state.getIn([ "items", name, "board", "filled" ]))
			.toEqualImmutable(fromJS([
				{
					position,
					color,
				},
			]));
	});

	it("SET_CURRENT_PLAYER", () => {
		const name = "test";

		const player1 = fromJS({
			color: "blue",
			user: {
				id: "1",
				name: {
					display: "Tester 1",
				},
				isMe: true,
			},
			order: 0,
		});

		const player2 = fromJS({
			color: "red",
			user: {
				id: "2",
				name: {
					display: "Tester 2",
				},
			},
			order: 1,
		});

		const game = fromJS({
			name,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [
				player1,
				player2,
			],
			currentPlayerColor: player1.get("color"),
		});

		const state = [
			fetchedGame({
				game,
			}),
			setCurrentPlayer({
				gameName: name,
				color: player2.get("color"),
			}),
		].reduce(reducer, undefined);

		expect(state.getIn([ "items", name, "currentPlayerColor" ]))
			.toBe(player2.get("color"));
	});

	it("SET_WINNER", () => {
		const name = "test";

		const player1 = fromJS({
			color: "blue",
			user: {
				id: "1",
				name: {
					display: "Tester 1",
				},
				isMe: true,
			},
			order: 0,
		});

		const player2 = fromJS({
			color: "red",
			user: {
				id: "2",
				name: {
					display: "Tester 2",
				},
			},
			order: 1,
		});

		const game = fromJS({
			name,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [
				player1,
				player2,
			],
			currentPlayerColor: player1.get("color"),
		});

		const state = [
			fetchedGame({
				game,
			}),
			setWinner({
				gameName: name,
				color: player2.get("color"),
			}),
		].reduce(reducer, undefined);

		expect(state.getIn([ "items", name, "winner" ]))
			.toBe(player2.get("color"));
	});

	it("GAME_STARTED", () => {
		const name = "test";

		const player1 = fromJS({
			color: "blue",
			user: {
				id: "1",
				name: {
					display: "Tester 1",
				},
				isMe: true,
			},
			order: 0,
		});

		const player2 = fromJS({
			color: "red",
			user: {
				id: "2",
				name: {
					display: "Tester 2",
				},
			},
			order: 1,
		});

		const game = fromJS({
			name,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [
				player1,
				player2,
			],
			currentPlayerColor: player1.get("color"),
		});

		const state = [
			fetchedGame({
				game,
			}),
			gameStarted({
				gameName: name,
			}),
		].reduce(reducer, undefined);

		expect(state.getIn([ "items", name, "isStarted" ]))
			.toBeTruthy();
	});

	it("FIND_OPEN_GAMES", () => {
		const name = "test";

		const player1 = fromJS({
			color: "blue",
			user: {
				id: "1",
				name: {
					display: "Tester 1",
				},
				isMe: true,
			},
			order: 0,
		});

		const player2 = fromJS({
			color: "red",
			user: {
				id: "2",
				name: {
					display: "Tester 2",
				},
			},
			order: 1,
		});

		const game = fromJS({
			name,
			board: {
				width: 10,
				height: 10,
				filled: [],
			},
			playerLimit: 3,
			players: [
				player1,
				player2,
			],
			currentPlayerColor: player1.get("color"),
		});

		let state = fromJS({
			items: {
				[game.name]: name,
			},
			openGames: [ game.name ],
		});

		state = [
			findOpenGames({}),
		].reduce(reducer, state);

		expect(state.get("openGames"))
			.toBe(undefined);
	});
});
