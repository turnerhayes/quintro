import { takeLatest, call, put } from "redux-saga/effects";

import {
	FIND_OPEN_GAMES,
	findOpenGames,
	setFindOpenGamesResults,
} from "@app/actions";
import { findOpenGames as findOpenGamesAPI } from "@app/api/games";

import rootSaga, { findOpenGamesSaga } from "./saga";

describe("FindGame saga", () => {
	it("should watch for the latest FIND_OPEN_GAMES action", () => {
		const gen = rootSaga();

		const next = gen.next();

		expect(next.done).toBeFalsy();

		expect(next.value).toEqual(takeLatest(
			FIND_OPEN_GAMES,
			findOpenGamesSaga
		));

		expect(gen.next()).toHaveProperty("done", true);
	});

	it("should dispatch a setFindOpenGamesResults action", () => {
		const numberOfPlayers = 3;

		const gen = findOpenGamesSaga(findOpenGames({
			numberOfPlayers,
		}));

		let next = gen.next();

		expect(next.done).toBeFalsy();

		expect(next.value).toEqual(call(
			findOpenGamesAPI,
			{
				numberOfPlayers,
			}
		));

		const games = [
			{
				name: "test",
				board: {
					width: 15,
					height: 15,
					filledCells: [],
				},
				players: [],
				playerLimit: 3,
				isStarted: false,
			},
		];

		next = gen.next(games);

		expect(next.value).toEqual(put(
			setFindOpenGamesResults({ games })
		));

		expect(gen.next()).toHaveProperty("done", true);
	});
});
