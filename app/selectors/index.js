import { createSelector }     from "reselect";
import { Map }                from "immutable";

import { wrapSelectors }      from "./utils";
import * as uiSelectors       from "./ui";
import userSelectors     from "./users";
import gameSelectors     from "./games";
import * as settingsSelectors from "./settings";

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

const getPlayerUserIds = createSelector(
	wrappedGames.getPlayers,
	(players) => players && players.map((player) => player.get("userID")).toSet()
);

const getPlayerUsers = createSelector(
	(state) => state,
	getPlayerUserIds,
	(state, userIDs) => {
		if (!userIDs) {
			return undefined;
		}

		return wrappedUsers.filterUsers(state, {
			userIDs,
		}).toList();
	}
);

const getPlayerUser = createSelector(
	getPlayerUsers,
	(state, props) => props.player,
	(playerUsers, player) => playerUsers.find((user) => user.get("id") === player.get("userID"))
);


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

const isWatchingGame = createSelector(
	wrappedUsers.getCurrentUser,
	wrappedGames.getWatchers,
	(currentUser, watchers) => !!(
		currentUser && watchers && !!watchers.find(
			(watcher) => watcher.get("userID") === currentUser.get("id")
		)
	)
);


export default {
	ui: uiSelectors,
	users: wrappedUsers,
	settings: settingsSelectors,
	games: {
		...wrappedGames,
		getPlayerUsers,
		getPlayerUser,
		getCurrentUserPlayer,
		isInGame,
		isWatchingGame,
	},
};
