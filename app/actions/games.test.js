import { isFSA } from "flux-standard-action";

import * as actions from "./games";

const actionTypeRegex = /^[A-Z][A-Z_]*[A-Z]$/;

function toCamelCase(str) {
	const words = str.split("_");

	const wordCount = words.length;

	words[0] = words[0].toLowerCase();

	for (let i = 1; i < wordCount; i++) {
		words[i] = words[i][0].toUpperCase() + words[i].substring(1).toLowerCase();
	}

	return words.join("");
}

const actionsToTest = Object.keys(actions).reduce(
	(actionMap, key) => {
		if (actionTypeRegex.test(key)) {
			const actionCreator = actions[toCamelCase(key)];

			if (actionCreator !== undefined) {
				actionMap[key] = {
					actionType: actions[key],
					actionTypeName: key,
					actionCreator,
				};
			}
		}

		return actionMap;
	},
	{}
);

describe("games action creators", () => {
	function runActionTest({
		actionCreator,
		actionType,
		actionTypeName,
		args,
		expectedPayload = (args) => args,
	}) {
		describe(actionCreator.name, () => {
			it(`should return a ${actionTypeName} action`, () => {
				const action = actionCreator(args);

				expect(isFSA(action)).toBeTruthy();

				expect(action).toEqual({
					type: actionType,
					payload: expectedPayload(args),
				});
			});
		});
	}

	[
		{
			...actionsToTest.FIND_OPEN_GAMES,
			args: {
				numberOfPlayers: 4,
			},
		},
		{
			...actionsToTest.GET_USER_GAMES,
		},
		{
			...actionsToTest.CREATE_GAME,
			args: {
				width: 10,
				height: 15,
				name: "test",
				playerLimit: 4,
			},
		},
		{
			...actionsToTest.GAME_CREATED,
			args: {
				game: {
					board: {
						width: 10,
						height: 15,
						filled: [],
					},
					name: "test",
					playerLimit: 4,
					players: [],
				}
			},
		},
		{
			...actionsToTest.FETCHING_USER_GAMES,
		},
		{
			...actionsToTest.FETCHED_USER_GAMES,
			args: {
				games: [
					{
						name: "test1",
						board: {
							width: 15,
							height: 15,
							filled: [],
						},
						playerLimit: 3,
						players: [
							{
								color: "blue",
								user: {
									id: "1",
									isMe: true,
									name: {
										display: "Test Testerson",
									},
								},
							},
						],
					},
					{
						name: "test2",
						board: {
							width: 15,
							height: 15,
							filled: [],
						},
						playerLimit: 3,
						players: [
							{
								color: "red",
								user: {
									id: "1",
									isMe: true,
									name: {
										display: "Test Testerson",
									},
								},
							},
						],
					},
					{
						name: "test3",
						board: {
							width: 15,
							height: 15,
							filled: [],
						},
						playerLimit: 3,
						players: [
							{
								color: "green",
								user: {
									id: "1",
									isMe: true,
									name: {
										display: "Test Testerson",
									},
								},
							},
						],
					},
				],
			},
		},
		{
			...actionsToTest.GET_GAME,
			args: { name: "test" },
		},
		{
			...actionsToTest.FETCHING_GAME,
			args: { name: "test" },
		},
		{
			...actionsToTest.FETCHED_GAME,
			args: {
				game: {
					board: {
						width: 10,
						height: 15,
						filled: [],
					},
					name: "test",
					playerLimit: 4,
					players: [],
				},
			},
		},
		{
			...actionsToTest.UPDATE_GAME,
			args: { gameName: "test" },
		},
		{
			...actionsToTest.GAME_UPDATED,
			args: {
				gameName: "test",
				update: {
					watchers: {
						count: 6,
					},
				},
			},
		},
		{
			...actionsToTest.CHECK_GAME_NAME,
			args: { name: "test" },
		},
		{
			...actionsToTest.CHECKED_GAME_NAME,
			args: { result: true },
		},
		{
			...actionsToTest.JOIN_GAME,
			args: {
				gameName: "test",
				color: "green",
			},
		},
		{
			...actionsToTest.LEAVE_GAME,
			args: { gameName: "test" },
		},
		{
			...actionsToTest.WATCH_GAME,
			args: { gameName: "test" },
		},
		{
			...actionsToTest.START_GAME,
			args: { gameName: "test" },
		},
		{
			...actionsToTest.SET_WINNER,
			args: {
				gameName: "test",
				color: "white",
			},
		},
		{
			...actionsToTest.UPDATE_WATCHERS,
			args: {
				gameName: "test",
				watchers: {
					count: 4,
				},
			},
		},
		{
			...actionsToTest.ADD_PLAYER,
			args: {
				gameName: "test",
				player: {
					id: "1",
					name: {
						display: "Test Testerson",
					},
				},
			},
		},
		{
			...actionsToTest.SET_CURRENT_PLAYER,
			args: {
				gameName: "test",
				color: "blue",
			},
		},

		{
			...actionsToTest.SET_PLAYER_PRESENCE,
			args: {
				gameName: "test",
				presenceMap: {
					blue: true,
					red: false,
				},
				setMissingPlayersTo: false,
			},
		},
		{
			...actionsToTest.PLACE_MARBLE,
			args: {
				gameName: "test",
				position: [ 0, 1 ],
			},
		},
		{
			...actionsToTest.SET_MARBLE,
			args: {
				gameName: "test",
				position: [ 0, 1 ],
				color: "red",
			},
		},
		{
			...actionsToTest.SET_GAME_PLAY_ERROR,
			args: {
				gameName: "test",
				error: new Error("Test error"),
			},
		},
	].forEach(
		(actionArgs) => runActionTest(actionArgs)
	);
});
