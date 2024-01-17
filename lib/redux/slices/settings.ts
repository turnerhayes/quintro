import {createSlice, PayloadAction} from "@reduxjs/toolkit";


export interface SettingSliceState {
    notificationsEnabled: boolean;
    soundEffectsEnabled: boolean;
}

const initialState: SettingSliceState = {
    notificationsEnabled: false,
    soundEffectsEnabled: false,
};

const SettingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        changeSetting(state, {payload: {notificationsEnabled, soundEffectsEnabled}}: PayloadAction<Partial<SettingSliceState>>) {
            if (notificationsEnabled != null) {
                state.notificationsEnabled = notificationsEnabled;
            }
            if (soundEffectsEnabled != null) {
                state.soundEffectsEnabled = soundEffectsEnabled;
            }
        },
    },
});

export {SettingsSlice};

export const {reducer, actions} = SettingsSlice;
