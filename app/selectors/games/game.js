import { List, Map } from "immutable";
import {
	createSelector,
	createSelectorCreator,
	defaultMemoize
} from "reselect";
import isEqual from "lodash/isEqual";

const createDeepSelector = createSelectorCreator(defaultMemoize, isEqual);

import * as quintroSelectors from "./quintros";

import * as sharedGameSelectors from "@shared-lib/selectors/game";

const getWinner = (game) => game.get("winner");

const getPlayers = (game) => game.get("players", List());

const getWatchers = (game) => game.get("watchers", Map());

const getPlayerColors = createSelector(
	getPlayers,
	(players) => players.map((player) => player.get("color"))
);

const canAddPlayerColor = createDeepSelector(
	getPlayerColors,
	(state, props) => props.color,
	(existingColors, newColor) => newColor && !existingColors.includes(newColor)
);

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
	getPlayerColors,
	getWatchers,
	getCurrentPlayer,
	isWatchingGame,
	getWatcherCount,
	canAddPlayerColor,
	...quintroSelectors,
	...sharedGameSelectors,
};
