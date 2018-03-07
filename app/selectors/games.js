import { List, Set }      from "immutable";
import { createSelector } from "reselect";
import {
	getCurrentUser,
	filterUsers,
}                         from "./users";
import * as quintroSelectors from "./games/quintros";

export const getGame = (state, { gameName }) => state.getIn(["games", "items", gameName]);

export const getJoinedGames = (state) => state.getIn(["games", "joinedGames"], Set());

export const isLoaded = createSelector(
	getGame,
	(game) => game && game.get("isLoaded")
);

export const getWinner = createSelector(
	getGame,
	(game) => game && game.get("winner")
);

export const isOver = createSelector(
	getWinner,
	(winner) => !!winner
);

export const getPlayers = createSelector(
	[
		getGame
	],
	(game) => game && game.get("players", List())
);

export const getPlayerUsers = (state, props) => {
	const players = getPlayers(state, props);

	if (!players) {
		return undefined;
	}

	return filterUsers(state, {
		userIDs: players.map((player) => player.get("userID")).toSet(),
	}).toList();
};

export const getPlayerUser = createSelector(
	getPlayerUsers,
	(state, props) => props.player,
	(playerUsers, player) => playerUsers.find((user) => user.get("id") === player.get("userID"))
);

export const getWatchers = createSelector(
	[
		getGame
	],
	(game) => game && game.get("watchers", List())
);

export const getCurrentUserPlayer = createSelector(
	[
		getCurrentUser,
		getPlayers
	],
	(currentUser, players) => currentUser && players && players.find(
		(player) => player.get("userID") === currentUser.get("id")
	)
);

export const isInGame = createSelector(
	[
		getCurrentUserPlayer,
	],
	(currentUserPlayer) => !!currentUserPlayer
);

export const isWatchingGame = createSelector(
	[
		getCurrentUser,
		getWatchers
	],
	(currentUser, watchers) => !!(
		currentUser && watchers && !!watchers.find(
			(watcher) => watcher.get("userID") === currentUser.get("id")
		)
	)
);


const getLastPlacedCellPosition = createSelector(
	getGame,
	(game) => {
		const lastFilled = game.getIn(["board", "filled"], List()).last();

		return lastFilled && lastFilled.get("position");
	}
);

export const hasJoinedGame = createSelector(
	[
		getJoinedGames,
		(state, props) => props.gameName,
	],
	(joinedGames, gameName) => joinedGames.includes(gameName)
);

export const getQuintros = createSelector(
	getGame,
	getLastPlacedCellPosition,
	(game, position) => game && quintroSelectors.getQuintrosForCell(game, { position })
);
