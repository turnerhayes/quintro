import { combineReducers } from "@reduxjs/toolkit";
import {
    persistReducer,
    type Storage
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


export const getPersistedReducer = (storageInstance: Storage = storage) => {
    return persistReducer({
        key: 'root',
        storage: storageInstance,
    }, rootReducer)
}

export type RootState = ReturnType<ReturnType<typeof getPersistedReducer>>;
