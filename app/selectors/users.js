import { createSelector }     from "reselect";
import { Map, List }          from "immutable";

export const getCurrentUser = (state) => state.getIn(["users", "items", state.getIn(["users", "currentID"])]);

export function filterUsers(state, props) {
	const users = state.getIn([ "users", "items" ]);
	const { userIDs } = props;

	if (userIDs === undefined) {
		return users;
	}

	if (userIDs.length === 0) {
		return Map();
	}

	return users.filter(
		(user, id) => userIDs.indexOf(id) >= 0
	);
}

export const userSelector = createSelector(
	[
		getCurrentUser,
		filterUsers,
	],
	(currentUser, users) => {
		if (!currentUser) {
			return users;
		}

		return users.map(
			(user, id) => user.set("isMe", id === currentUser.id)
		);
	}
);

export const playerSelector = createSelector(
	[
		userSelector,
		(state, props) => props.players
	],
	(users, players) => {
		if (!users || !players) {
			return undefined;
		}

		let isMissingUsers = false;

		const playersWithUsers = [];

		players.forEach(
			(player) => {
				if (!users.has(player.get("userID"))) {
					isMissingUsers = true;
					return false;
				}

				playersWithUsers.push(player.set("user", users.get(player.get("userID"))));
			}
		);

		return isMissingUsers ? undefined : List(playersWithUsers);
	}
);
