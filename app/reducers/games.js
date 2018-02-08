import { Map, fromJS } from "immutable";
import {
	FETCHED_USER_GAMES,
	FETCHED_GAME,
	ADD_PLAYER,
	ADD_WATCHER,
	REMOVE_WATCHER,
} from "@app/actions";

export default function gamesReducer(state = Map(), action) {
	switch (action.type) {
		case FETCHED_USER_GAMES: {
			return state.mergeIn(["items"], action.payload.games.reduce(
				(map, game) => map.set(game.get("name"), game),
				Map()
			));
		}

		case FETCHED_GAME: {
			let { game } = action.payload;

			game = game.updateIn(
				["players"],
				(players) => players.map(
					(player) => player.set("userID", player.getIn(["user", "id"]))
						.delete("user")
				)
			);

			return state.setIn(["items", game.get("name")], game);
		}

		case ADD_PLAYER: {
			const { gameName, player } = action.payload;

			return state.setIn(
				["items", gameName, "players", player.order],
				fromJS(player)
			);
		}

		case ADD_WATCHER: {
			const { gameName, user } = action.payload;

			const userId = "id" in user ?
				user.id :
				user.sessionID;

			return state.updateIn(
				["items", gameName, "watchers"],
				(watchers) => (watchers || Map()).set(userId, fromJS(user))
			);
		}

		case REMOVE_WATCHER: {
			const { gameName, user } = action.payload;

			const userId = "id" in user ?
				user.id :
				user.sessionID;

			return state.updateIn(
				["items", gameName, "watchers"],
				(watchers) => (watchers || Map()).delete(userId)
			);
		}

		default: return state;
	}
}
