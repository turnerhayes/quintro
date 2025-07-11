"use client";

import {
    configureStore
} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
    persistStore,
    type Persistor,
    PERSIST,
    REHYDRATE,
    FLUSH,
    PAUSE,
    PURGE,
    REGISTER
} from 'redux-persist';

import { gamesApi } from "@/client/api/games";
import notificationListenerMiddleware from "@/client/redux/notification-listener";
import { persistedReducer } from "@/client/redux/reducer";


const _makeStore = () => {
    let store;

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
            }).concat(gamesApi.middleware).prepend(notificationListenerMiddleware),
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
        _persistor = persistStore(_store);
    }

    return {
        store: _store!,
        persistor: _persistor!,
    };
};

type StoreType = ReturnType<typeof _makeStore>;

export type AppDispatch = StoreType["dispatch"];
