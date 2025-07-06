import {configureStore} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { gamesApi } from "@/api/games";

import { settingsReducer } from "@/redux/slices/settings";

export const store = configureStore({
    reducer: {
        [gamesApi.reducerPath]: gamesApi.reducer,
        settings: settingsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(gamesApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
