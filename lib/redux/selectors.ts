import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";

export const areNotificationsEnabled = (state: RootState) => state.settings.notificationsEnabled;
export const areSoundEffectsEnabled = (state: RootState) => state.settings.soundEffectsEnabled;
