import { Map } from "immutable";
import {
	FETCHED_USER_GAMES,
	FETCHED_GAME,
	ADD_PLAYER,
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

		case ADD_PLAYER: {
			const { player } = action.payload;

			return state.setIn(
				["items", player.getIn(["user", "id"])],
				player.get("user")
			);
		}

		default: return state;
	}
}
