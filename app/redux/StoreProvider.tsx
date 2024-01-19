'use client'

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeOrGetStore, AppStore } from "@lib/redux/store";
import gamesListenerMiddleware from "@app/redux/listeners/games";


export default function StoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeRef = useRef<AppStore>();
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeOrGetStore({
            extraMiddleware: [
                gamesListenerMiddleware,
            ],
        });
    }

    return (
        <Provider store={storeRef.current}>
            {children}
        </Provider>
    );
}