import { Map } from "immutable";
import { createSelector } from "reselect";

const getCurrentUserID = (state) => state.get("currentID");

const getUsers = (state) => state.get("items");

/**
 * This selector gets the user playing games, if any.
 *
 * @function
 *
 * @param {external:Immutable.Map} state - the state to select into
 *
 * @returns {!external:Immutable.Map} the logged in user, if any
 */
const getCurrentUser = createSelector(
	getUsers,
	(users) => users.find((user) => user.get("isMe"))
);

/**
 * This selector gets the currently logged in user, if any.
 *
 * This is distict from `getCurrentUser` in that a user may not be logged into
 * the app, but still be a player in a game, in which case `getCurrentUser`
 * will return the user associated with that player, but `getLoggedInUser`
 * will return nothing. If the user is logged into an account on the app, these
 * selectors should select the same user.
 *
 * @function
 *
 * @param {external:Immutable.Map} state - the state to select into
 *
 * @returns {!external:Immutable.Map} the logged in user, if any
 */
const getLoggedInUser = createSelector(
	getUsers,
	getCurrentUserID,
	(users, currentID) => {
		if (!currentID) {
			return undefined;
		}

		return users.find((user) => user.get("id") === currentID);
	}
);

const filterUsers = createSelector(
	getUsers,
	(state, props) => props,
	(users, props) => {
		const { userIDs } = props;

		if (userIDs === undefined) {
			return users;
		}

		if (userIDs.length === 0) {
			return Map();
		}

		return users.filter(
			(user, id) => userIDs.includes(id)
		);
	}
);

export default {
	getUsers,
	getCurrentUser,
	getLoggedInUser,
	filterUsers
};
