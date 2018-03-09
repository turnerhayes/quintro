import { List } from "immutable";
import { createSelector } from "reselect";
import quintroSelectors from "./quintros";

const getWinner = (game) => game.get("winner");

const isLoaded = (game) => game.get("isLoaded");

const getPlayers = (game) => game.get("players", List());

const getWatchers = (game) => game.get("watchers", List());

const isOver = createSelector(
	getWinner,
	(winner) => !!winner
);

export default {
	getWinner,
	isLoaded,
	getPlayers,
	getWatchers,
	isOver,
	...quintroSelectors,
};
