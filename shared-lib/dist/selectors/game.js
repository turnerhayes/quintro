"use strict";
const { List } = require("immutable");
const { createSelector } = require("reselect");
const isOver = (game) => game.get("isStarted", false) && !!game.get("winner");
const getCurrentPlayerColor = createSelector((game) => game, (game) => {
    const players = game.get("players", List());
    if (!game.get("isStarted") || players.isEmpty()) {
        return undefined;
    }
    const lastMove = game.getIn(["board", "filledCells"], List()).last();
    if (!lastMove) {
        return players.getIn([0, "color"]);
    }
    return players.getIn([
        (players.findIndex((player) => player.get("color") === lastMove.get("color")) + 1) % players.size,
        "color"
    ]);
});
const selectors = {
    isOver,
    getCurrentPlayerColor,
};
exports = module.exports = {
    ...selectors,
    default: selectors,
};
