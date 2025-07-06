import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SupportedColorScheme } from "@mui/material";

const initialState = {
    soundEffectsEnabled: false,
    notificationsEnabled: false,
    colorScheme: "system" as SupportedColorScheme,
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
        setColorScheme: (state, action: PayloadAction<SupportedColorScheme>) => {
            state.colorScheme = action.payload;
        },
    },
});

export const {
    setSoundEffectsEnabled,
    setNotificationsEnabled,
    setColorScheme,
} = settingsSlice.actions;

export const settingsReducer = settingsSlice.reducer;
