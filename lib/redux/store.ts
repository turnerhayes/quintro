import { Middleware, configureStore } from "@reduxjs/toolkit";
import { gameApiSlice } from "@lib/services/games-service";
import {reducer as settingsReducer, actions as settingsActions} from "@lib/redux/slices/settings";


interface MakeStoreArgs {
    extraMiddleware?: Middleware[];
}

export const makeStore = ({extraMiddleware}: MakeStoreArgs = {}) => {
    return configureStore({
        reducer: {
            [gameApiSlice.reducerPath]: gameApiSlice.reducer,
            settings: settingsReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
            gameApiSlice.middleware,
            ...extraMiddleware,
        )
    });
};

let instance: ReturnType<typeof makeStore>|null = null;

export const makeOrGetStore = (args: MakeStoreArgs = {}) => {
    if (instance === null) {
        instance = makeStore(args);
    }

    return instance;
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];

export {settingsActions};
