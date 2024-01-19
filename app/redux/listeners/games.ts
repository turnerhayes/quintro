import { createListenerMiddleware } from "@reduxjs/toolkit";
import { joinGame, playersJoined, watchGame } from "@lib/redux/actions/games";
import { EventName, clientInstance } from "@lib/services/game-socket-client";
import { gameApiSlice } from "@lib/services/games-service";
import { makeOrGetStore } from "@lib/redux/store";


clientInstance.listen(EventName.PLAYERS_JOINED, (err, {players}) => {
    makeOrGetStore().dispatch(playersJoined({players}));
});

const gamesListenerMiddleware = createListenerMiddleware();

gamesListenerMiddleware.startListening({
    actionCreator: joinGame,
    effect({payload: {gameName, colors}}, api) {
        clientInstance.joinGame(gameName, colors);
    },
});

gamesListenerMiddleware.startListening({
    actionCreator: playersJoined,
    effect({payload: {players, gameName}}) {
        gameApiSlice.util.updateQueryData("getGames", {gameName}, (draft) => {
            const game = draft.find((game) => game.name === gameName);
            if (!game) {
                throw new Error(`Could not find game ${game} in data cache`);
            }
            game.players.push(...players);
        });
    },
});

gamesListenerMiddleware.startListening({
    actionCreator: watchGame,
    effect({payload: gameName}) {
        clientInstance.watchGame(gameName);
    },
})

export default gamesListenerMiddleware.middleware;