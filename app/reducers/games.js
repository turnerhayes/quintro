import { Map, Set, List, fromJS } from "immutable";
import {
	FETCHED_USER_GAMES,
	FETCHED_GAME,
	GAME_UPDATED,
	GAME_STARTED,
	ADD_PLAYER,
	UPDATE_WATCHERS,
	SET_PLAYER_PRESENCE,
	LEAVE_GAME,
	SET_MARBLE,
	SET_CURRENT_PLAYER,
	SET_WINNER,
} from "@app/actions";

function prepareGame(game) {
	return game.updateIn(
		["players"],
		(players) => players.map(
			(player) => player.set("userID", player.getIn(["user", "id"]))
				.delete("user")
				.delete("order")
		)
	).set("isLoaded", true);
}

export default function gamesReducer(state = Map(), action) {
	switch (action.type) {
		case FETCHED_USER_GAMES: {
			return state.mergeIn(["items"], action.payload.games.reduce(
				(map, game) => map.set(game.get("name"), prepareGame(game)),
				Map()
			));
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

		case ADD_PLAYER: {
			const gameName = action.payload.gameName;
			const player = fromJS(action.payload.player);

			state = state.setIn(
				["items", gameName, "players", player.get("order")],
				player.set("userID", player.getIn(["user", "id"]))
					.delete("user")
					.delete("order")
			);

			if (player.getIn(["user", "isMe"])) {
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
				["items", gameName, "board", "filled"],
				(filledCells) => (filledCells || List()).push(
					fromJS({
						position,
						color,
					})
				)
			);
		}

		case SET_CURRENT_PLAYER: {
			const { gameName, color } = action.payload;

			return state.setIn(
				["items", gameName, "currentPlayerColor"],
				color
			);
		}

		case SET_WINNER: {
			const { gameName, color } = action.payload;

			return state.setIn(
				["items", gameName, "winner"],
				color
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
