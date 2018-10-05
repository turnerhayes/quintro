import { Map, fromJS } from "immutable";
import {
	FETCHED_USER_GAMES,
	FETCHED_GAME,
	ADD_PLAYERS,
	UPDATE_USER_PROFILE,
}              from "@app/actions";

function getUsersFromPlayers(game) {
	return game.get("players").map(
		(player) => player.get("user")
	).reduce(
		(userMap, user) => userMap.set(user.get("id"), user),
		Map()
	);
}

export default function usersReducer(state = Map(), action) {
	switch (action.type) {
		case FETCHED_USER_GAMES: {
			const { games } = action.payload;

			const users = games.map(getUsersFromPlayers).reduce(
				(userMap, users) => userMap.merge(users),
				Map()
			);

			return state.mergeIn(
				["items"],
				users
			);
		}

		case FETCHED_GAME: {
			const { game } = action.payload;

			const users = getUsersFromPlayers(game);

			return state.mergeIn(
				["items"],
				users
			);
		}

		case ADD_PLAYERS: {
			const players = fromJS(action.payload.players);

			return state.update(
				"items",
				(users) => players.reduce(
					(users, player) => users.set(
						player.getIn(["user", "id"]),
						player.get("user")
					),
					users || Map()
				)
			);
		}

		case UPDATE_USER_PROFILE: {
			const user = fromJS(action.payload.user);

			return state.mergeDeepIn(
				["items", user.get("id")],
				user
			);
		}

		default: return state;
	}
}
