import type { RootState } from "@/client/redux/reducer";

export const getNotificationsEnabled = (state: RootState) => state.settings.notificationsEnabled;

export const getSoundEffectsEnabled = (state: RootState) => state.settings.soundEffectsEnabled;
