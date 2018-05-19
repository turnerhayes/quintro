/* global Promise */

import { List } from "immutable";

import {
	getUserGames,
	FETCHING_USER_GAMES,
	FETCHED_USER_GAMES,
} from "@app/actions";
import { runSaga } from "@app/utils/test-utils";

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

		const { dispatchers, dispatched } = await runSaga({
			async getSaga() {
				const module = await import("./saga");

				return module.default;
			}
		});

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
