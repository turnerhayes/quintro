import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";


const getAllGamesSelector = (state: RootState) => [...state.games.items];

const getGameSelector = (state: RootState, {name}: {name: string;}) => state
    .games.items.find(({name: gameName}) => name = gameName);

const getGamePlayersSelector = createSelector(
    [
        getGameSelector,
    ],
    (game) => game.players
);


const getCurrentPlayerColorSelector = createSelector(
	[
        getGameSelector,
        getGamePlayersSelector,
    ],
	(game, players) => {
		if (!game.isStarted || players.length == 0) {
			return undefined;
		}

		const lastMove = game.board.filledCells[game.board.filledCells.length - 1]

		if (!lastMove) {
			return players[0].color;
		}

		return players[
			(players.findIndex(
                (player) => player.color === lastMove.color) + 1
            ) % players.length
        ].color;
	}
);

const getCurrentPlayerSelector = createSelector(
    [
        getGamePlayersSelector,
        getCurrentPlayerColorSelector,
    ],
    (players, currentColor) => players.find((player) => player.color === currentColor)
);


export const selectors = {
    getAllGames: getAllGamesSelector,
    getGame: getGameSelector,
    getGamePlayers: getGamePlayersSelector,
    getCurrentPlayerColor: getCurrentPlayerColorSelector,
    getCurrentPlayer: getCurrentPlayerSelector,
};