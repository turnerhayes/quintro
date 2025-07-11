import { combineReducers } from "@reduxjs/toolkit";
import {
    persistReducer,
} from 'redux-persist';
import { storage } from "@/client/redux/storage";
import { gamesApi } from "@/client/api/games";
import { settingsReducer } from "@/client/redux/slices/settings";

export const rootReducer = combineReducers(
    {
        [gamesApi.reducerPath]: gamesApi.reducer,
        settings: settingsReducer,
    }
);

const persistConfig = {
    key: 'root',
    storage,
};

export const persistedReducer = persistReducer(persistConfig, rootReducer);

export type RootState = ReturnType<typeof persistedReducer>;
