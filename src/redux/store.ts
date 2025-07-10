"use client";

import {
    combineReducers,
    configureStore
} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
    persistStore,
    persistReducer,
    type Persistor,
    PERSIST,
    REHYDRATE,
    FLUSH,
    PAUSE,
    PURGE,
    REGISTER
} from 'redux-persist';

import { storage } from "@/redux/storage";
import { gamesApi } from "@/api/games";
import { settingsReducer } from "@/redux/slices/settings";


const _makeStore = () => {
    const rootReducer = combineReducers(
        {
            [gamesApi.reducerPath]: gamesApi.reducer,
            settings: settingsReducer,
        }
    );

    let store;

    const persistConfig = {
        key: 'root',
        storage,
    };

    // const persistedReducer = persistReducer(persistConfig, rootReducer);
    const persistedReducer = rootReducer;

    store = configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [
                        PERSIST,
                        REHYDRATE,
                        FLUSH,
                        PAUSE,
                        PURGE,
                        REGISTER,
                    ],
                },
            }).concat(gamesApi.middleware),
        devTools: process.env.NODE_ENV !== "production",
    });

    setupListeners(store.dispatch);

    return store;
};

let _store: ReturnType<typeof _makeStore>|null = null;
let _persistor: Persistor|null = null;

export const getStore = () => {
    if (!_store) {
        _store = _makeStore();
        // _persistor = persistStore(_store);
    }

    return {
        store: _store!,
        persistor: _persistor!,
    };
};

type StoreType = ReturnType<typeof _makeStore>;

export type RootState = ReturnType<StoreType["getState"]>;

export type AppDispatch = StoreType["dispatch"];
