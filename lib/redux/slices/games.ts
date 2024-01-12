import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {Game} from "@shared/game";

export interface GamesState {
    items: Game[];
}

const initialState: GamesState = {
    items: [],
};

export const gamesSlice = createSlice({
    name: "games",
    initialState,
    reducers: {
        addGames: (state, action: PayloadAction<Game[]>) => {
            state.items.push(...action.payload);
        },

        joinGame: (state) => {
            
        },
    },
});

export const actions = gamesSlice.actions;

export const reducer = gamesSlice.reducer;
