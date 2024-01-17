import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import { gameApiSlice } from "@lib/services/games-service";
import {reducer as settingsReducer, actions as settingsActions} from "@lib/redux/slices/settings";

export const makeStore = () => {
    return configureStore({
        reducer: {
            [gameApiSlice.reducerPath]: gameApiSlice.reducer,
            settings: settingsReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
            gameApiSlice.middleware,
        )
    });
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];

export {settingsActions};
