import { List }           from "immutable";
import { createSelector } from "reselect";


export const getMeUser = (state) => state.getIn(
	["users", "items"]
).find((user) => user.get("isMe"));

export const getMePlayer = createSelector(
	[
		getMeUser,
		(state, props) => state.getIn(["games", "items", props.gameName, "players"], List()),
	],
	(meUser, players) => meUser && players.find(
		(player) => player.get("userID") === meUser.get("id")
	)
);

export const isInGame = createSelector(
	[
		getMePlayer,
	],
	(mePlayer) => !!mePlayer
);

export const isWatchingGame = createSelector(
	[
		getMeUser,
		(state, props) => state.getIn(["games", "items", props.gameName, "watchers"], List())
	],
	(meUser, watchers) => meUser && !!watchers.find(
		(player) => player.get("userID") === meUser.get("id")
	)
);
