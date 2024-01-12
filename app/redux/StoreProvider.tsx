'use client'

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@lib/redux/store";
import {actions} from "@lib/redux/slices/games";

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeRef = useRef<AppStore>();
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore();
        storeRef.current.dispatch(actions.addGames([
            {
                name: "test game 1",
                board: {
                    width: 10,
                    height: 10,
                    filledCells: [],
                },
                players: [],
                winner: null,
                isStarted: false,
                playerLimit: 3,
                playerPresence: {},
            },
        ]));
    }

    return (
        <Provider store={storeRef.current}>
            {children}
        </Provider>
    );
}