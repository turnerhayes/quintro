import { createSelector } from "reselect";
import { Map, List }      from "immutable";
import * as uiSelectors   from "./ui";
import * as userSelectors from "./users";

export const userSelector = createSelector(
	[
		(state) => state.get("users").currentUser,
		(state, props) => {
			const users = state.get("users").items;
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
				if (!users.has(player.userID)) {
					isMissingUsers = true;
					return false;
				}

				playersWithUsers.push(player.set("user", users.get(player.userID)));
			}
		);

		return isMissingUsers ? undefined : List(playersWithUsers);
	}
);

export const ui = uiSelectors;

export const users = userSelectors;
