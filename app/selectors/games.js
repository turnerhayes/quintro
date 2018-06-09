import { Map, Set }      from "immutable";
import { createSelector } from "reselect";
import { wrapSelectors } from "@app/selectors/utils";
import gameSelectors from "./games/game";

const getGames = (state) => state.get("items", Map());

const getJoinedGames = (state) => state.get("joinedGames", Set());

const getGame = createSelector(
	getGames,
	(state, props) => props.gameName,
	(games, gameName) => games.get(gameName)
);

const wrappedGameSelectors = wrapSelectors({
	selectors: gameSelectors,
	sliceSelector: getGame,
});

const hasJoinedGame = createSelector(
	getJoinedGames,
	(state, props) => props.gameName,
	(joinedGames, gameName) => joinedGames.includes(gameName)
);

const getOpenGames = createSelector(
	getGames,
	(state) => state.get("openGames"),
	(games, openGameNames) => openGameNames && games.filter(
		(game) => openGameNames.includes(game.get("name"))
	).toList()
);

export default {
	getGames,
	getGame,
	getOpenGames,
	getJoinedGames,
	hasJoinedGame,
	...wrappedGameSelectors,
};
