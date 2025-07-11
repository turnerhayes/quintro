import type { RootState } from "@/client/redux/store";

export const getNotificationsEnabled = (state: RootState) => state.settings.notificationsEnabled;

export const getSoundEffectsEnabled = (state: RootState) => state.settings.soundEffectsEnabled;
