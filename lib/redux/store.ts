import { configureStore } from "@reduxjs/toolkit";
import {reducer as gamesReducer} from "./slices/games";
import { gameApiSlice } from "../services/games-service";

export const makeStore = () => {
    return configureStore({
        reducer: {
            // games: gamesReducer,
            [gameApiSlice.reducerPath]: gameApiSlice.reducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
            gameApiSlice.middleware,
        )
    });
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
