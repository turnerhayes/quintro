"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Box } from "@mui/material";
import { getStore } from "@/redux/store";


const { store, persistor } = getStore();

export const ClientApp = (
    {
        children,
    }: {
        children: React.ReactNode | React.ReactNode[];
    }
) => {
    return (
        <Provider store={store}>
            {/* <PersistGate persistor={persistor}> */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100vh',
                        width: '100vw',
                        overflow: 'hidden',
                        backgroundColor: 'background.default',
                    }}
                >
                    {children}
                </Box>
            {/* </PersistGate> */}
        </Provider>
    );
};
