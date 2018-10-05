import { Map, Set, fromJS } from "immutable";

import Board from "@shared-lib/board";
import {
	FETCHED_USER_GAMES,
	FETCHED_GAME,
	GAME_UPDATED,
	GAME_STARTED,
	ADD_PLAYERS,
	UPDATE_WATCHERS,
	SET_PLAYER_PRESENCE,
	LEAVE_GAME,
	SET_MARBLE,
	SET_WINNER,
	FIND_OPEN_GAMES,
	SET_FIND_OPEN_GAMES_RESULTS,
} from "@app/actions";

function prepareGame(game) {
	const board = game.get("board").toJS();

	return game.update(
		"players",
		(players) => players.map(
			(player) => player.set("userID", player.getIn(["user", "id"]))
				.delete("user")
				.delete("order")
		)
	).set(
		"board",
		new Board(board),
	);
}

function addGames(state, games) {
	return state.mergeIn(["items"], games.reduce(
		(map, game) => map.set(game.get("name"), prepareGame(game)),
		Map()
	));
}

export default function gamesReducer(state = Map(), action) {
	switch (action.type) {
		case FETCHED_USER_GAMES: {
			return addGames(state, action.payload.games);
		}

		case FETCHED_GAME: {
			let { game } = action.payload;

			game = prepareGame(game);

			return state.mergeIn(["items", game.get("name")], game);
		}

		case GAME_UPDATED: {
			let { gameName, update } = action.payload;

			return state.mergeIn(
				["items", gameName],
				fromJS(update)
			);
		}

		case ADD_PLAYERS: {
			const gameName = action.payload.gameName;
			const players = fromJS(action.payload.players);

			let includesMe = false;

			players.forEach(
				(player) => {
					state = state.setIn(
						["items", gameName, "players", player.get("order")],
						player.set("userID", player.getIn(["user", "id"]))
							.delete("user")
							.delete("order")
					);

					includesMe = includesMe || player.getIn(["user", "isMe"]);
				}
			);
			if (includesMe) {
				state = state.update(
					"joinedGames",
					(joined) => (joined || Set()).add(gameName)
				);
			}

			return state;
		}

		case UPDATE_WATCHERS: {
			const { gameName, watchers } = action.payload;

			return state.mergeDeepIn(
				["items", gameName, "watchers"],
				fromJS(watchers)
			);
		}

		case SET_PLAYER_PRESENCE: {
			let { presenceMap } = action.payload;
			const { gameName, setMissingPlayersTo } = action.payload;

			if (setMissingPlayersTo !== undefined) {
				presenceMap = state.getIn(["items", gameName, "players"]).reduce(
					(presence, player) => {
						if (!presence.has(player.get("color"))) {
							presence = presence.set(player.get("color"), setMissingPlayersTo);
						}

						return presence;
					},
					presenceMap
				);
			}

			return state.mergeIn(
				["items", gameName, "playerPresence"],
				presenceMap
			);
		}

		case LEAVE_GAME: {
			const { gameName } = action.payload;

			return state.update(
				"joinedGames",
				(joined) => joined && joined.delete(gameName)
			);
		}

		case SET_MARBLE: {
			const { gameName, position, color } = action.payload;

			return state.updateIn(
				["items", gameName, "board", "filledCells"],
				(filledCells) => filledCells.push(
					fromJS({
						position,
						color,
					})
				)
			);
		}

		case SET_WINNER: {
			const { gameName, color } = action.payload;

			return state.setIn(
				["items", gameName, "winner"],
				color
			);
		}

		case FIND_OPEN_GAMES: {
			// Clear out open games list in preparation for it being populated
			// when the SET_FIND_OPEN_GAMES_RESULTS action is dispatched
			return state.delete("openGames");
		}

		case SET_FIND_OPEN_GAMES_RESULTS: {
			return addGames(state, action.payload.games)
				.set(
					"openGames",
					action.payload.games.map((game) => game.get("name"))
				);
		}

		case GAME_STARTED: {
			const { gameName } = action.payload;

			return state.setIn(
				["items", gameName, "isStarted"],
				true
			);
		}

		default: return state;
	}
}
