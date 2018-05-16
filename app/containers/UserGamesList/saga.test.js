/* global Promise */

import { Set, List } from "immutable";
import { runSaga } from "redux-saga";

import createReducer from "@app/reducers";
import {
	getUserGames,
	FETCHING_USER_GAMES,
	FETCHED_USER_GAMES,
} from "@app/actions";

describe("UserGamesList saga", () => {
	it("should get a list of user's games", async () => {
		// eslint-disable-next-line no-magic-numbers
		expect.assertions(3);

		const apiModule = await import("@app/api/games");

		let getUserGamesPromise;

		jest.spyOn(apiModule, "getUserGames").mockImplementation(
			() => {
				getUserGamesPromise = Promise.resolve(List());

				return getUserGamesPromise;
			}
		);

		const dispatched = [];

		const module = await import("./saga");

		const rootSaga = module.default;

		let dispatchers = Set();

		const reducer = createReducer();

		let state = reducer(undefined, {});

		runSaga(
			{
				dispatch: (action) => {
					dispatched.push(action);
					state = reducer(state, action);
				},
				getState: () => state,
				subscribe: (callback) => {
					dispatchers = dispatchers.add(callback);

					return () => {
						dispatchers.remove(callback);
					};
				},
			},
			rootSaga
		);

		dispatchers.forEach(
			(dispatcher) => dispatcher(getUserGames())
		);

		await getUserGamesPromise;

		expect(apiModule.getUserGames).toHaveBeenCalledWith();

		expect(dispatched.find((action) => action.type === FETCHING_USER_GAMES))
			.not.toBeUndefined();
		expect(dispatched.find((action) => action.type === FETCHED_USER_GAMES))
			.toHaveProperty("payload", { games: List() });
	});
});
