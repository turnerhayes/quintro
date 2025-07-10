import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    soundEffectsEnabled: false,
    notificationsEnabled: false,
};

export const settingsSlice = createSlice({
    initialState,
    name: "settings",
    reducers: {
        setSoundEffectsEnabled: (state, action: PayloadAction<boolean>) => {
            state.soundEffectsEnabled = action.payload;
        },
        setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
            state.notificationsEnabled = action.payload;
        },
    },
});

export const {
    setSoundEffectsEnabled,
    setNotificationsEnabled,
} = settingsSlice.actions;

export const settingsReducer = settingsSlice.reducer;
