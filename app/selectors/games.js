import {  Set }      from "immutable";
import { createSelector } from "reselect";
import { wrapSelectors } from "@app/selectors/utils";
import gameSelectors from "./games/game";

const getGame = (state, { gameName }) => state.getIn(["items", gameName]);

const getJoinedGames = (state) => state.get("joinedGames", Set());

const wrappedGameSelectors = wrapSelectors({
	selectors: gameSelectors,
	sliceSelector: getGame,
});

const hasJoinedGame = createSelector(
	getJoinedGames,
	(state, props) => props.gameName,
	(joinedGames, gameName) => joinedGames.includes(gameName)
);

export default {
	getGame,
	getJoinedGames,
	hasJoinedGame,
	...wrappedGameSelectors,
};
