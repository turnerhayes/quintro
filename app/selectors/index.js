import { createSelector } from "reselect";
import { Map }            from "immutable";

import { wrapSelectors }  from "./utils";
import uiSelectors        from "./ui";
import userSelectors      from "./users";
import gameSelectors      from "./games";
import settingsSelectors  from "./settings";

const wrappedGames = wrapSelectors({
	selectors: gameSelectors,
	sliceSelector: ["games"],
	defaultValue: Map(),
});

const wrappedUsers = wrapSelectors({
	selectors: userSelectors,
	sliceSelector: ["users"],
	defaultValue: Map(),
});

const wrappedUI = wrapSelectors({
	selectors: uiSelectors,
	sliceSelector: ["ui"],
	defaultValue: Map(),
});

const wrappedSettings = wrapSelectors({
	selectors: settingsSelectors,
	sliceSelector: ["settings"],
	defaultValue: Map(),
});

/**
 * Selector that gets user IDs for all the players in a game
 *
 * @function
 *
 * @param {external:Immutable.Map} state - the state to select from
 * @param {object} props - props for the selector
 * @param {string} props.gameName - the name of the game to get players from
 *
 * @returns {external:Immutable.Set} the user IDs of all the players in the game
 */
const getPlayerUserIds = createSelector(
	wrappedGames.getPlayers,
	(players) => players && players.map((player) => player.get("userID")).toSet()
);

/**
 * Selector that gets user information for all the players in a game
 *
 * @function
 *
 * @param {external:Immutable.Map} state - the state to select from
 * @param {object} props - props for the selector
 * @param {string} props.gameName - the name of the game to get players from
 *
 * @returns {external:Immutable.Map} the user information for the game's players,
 *	keyed by user ID
 */
const getPlayerUsers = createSelector(
	(state) => state,
	getPlayerUserIds,
	(state, userIDs) => {
		if (!userIDs) {
			return undefined;
		}

		return wrappedUsers.filterUsers(state, {
			userIDs,
		});
	}
);

const getPlayerUser = createSelector(
	getPlayerUsers,
	(state, props) => props.player,
	(playerUsers, player) => playerUsers.find((user) => user.get("id") === player.get("userID"))
);

/**
 * Selector that gets the player that corresponds to the application's current user, if applicable
 *
 * @function
 *
 * @param {external:Immutable.Map} state - the state to select from
 * @param {object} props - props for the selector
 * @param {string} props.gameName - the name of the game to get players from
 *
 * @returns {external:Immutable.Map} the player information for the current user
 */
const getCurrentUserPlayer = createSelector(
	wrappedUsers.getCurrentUser,
	wrappedGames.getPlayers,
	(currentUser, players) => currentUser && players && players.find(
		(player) => player.get("userID") === currentUser.get("id")
	)
);


const isInGame = createSelector(
	getCurrentUserPlayer,
	(currentUserPlayer) => !!currentUserPlayer
);

export default {
	ui: wrappedUI,
	users: wrappedUsers,
	settings: wrappedSettings,
	games: {
		...wrappedGames,
		getPlayerUsers,
		getPlayerUser,
		getCurrentUserPlayer,
		isInGame,
	},
};
