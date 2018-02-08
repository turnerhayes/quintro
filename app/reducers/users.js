import { Map } from "immutable";
import {
	FETCHED_GAME,
}              from "@app/actions";

export default function usersReducer(state = Map(), action) {
	switch (action.type) {
		case FETCHED_GAME: {
			const { game } = action.payload;

			const users = game.get("players").map(
				(player) => player.get("user")
			);

			return state.mergeIn(
				["items"],
				users.reduce(
					(userMap, user) => userMap.set(user.get("id"), user),
					Map()
				)
			);
		}

		default: return state;
	}
}
