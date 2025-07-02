import type { Game, GameID } from "@root/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface GamesState {
    items: {[gameName: GameID]: Game};
}

const initialState: GamesState = {
    items: {},
};

export const gamesSlice = createSlice({
    name: "games",
    initialState,
    reducers: {
        addGame(state, action: PayloadAction<Game>) {
            const game = action.payload;
            state.items[game.name] = game;
        },

        removeGame(state, action: PayloadAction<GameID>) {
            delete state.items[action.payload];
        },
    },
});

export const gamesActions = gamesSlice.actions;

export const gamesReducer = gamesSlice.reducer;
