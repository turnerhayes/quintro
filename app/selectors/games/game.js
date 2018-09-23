import { List, Map } from "immutable";
import { createSelector } from "reselect";

import * as quintroSelectors from "./quintros";

import * as sharedGameSelectors from "@shared-lib/selectors/game";

const getWinner = (game) => game.get("winner");

const getPlayers = (game) => game.get("players", List());

const getWatchers = (game) => game.get("watchers", Map());

const isWatchingGame = createSelector(
	getWatchers,
	(watchers) => !!(watchers && watchers.get("includesMe"))
);

const getWatcherCount = createSelector(
	getWatchers,
	(watchers) => (watchers && watchers.get("count")) || 0
);

const getCurrentPlayer = createSelector(
	getPlayers,
	sharedGameSelectors.getCurrentPlayerColor,
	(players, currentPlayerColor) => players.find(
		(player) => player.get("color") === currentPlayerColor
	)
);

export default {
	getWinner,
	getPlayers,
	getWatchers,
	getCurrentPlayer,
	isWatchingGame,
	getWatcherCount,
	...quintroSelectors,
	...sharedGameSelectors,
};
