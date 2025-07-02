import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import {BrowserRouter, Outlet, Route, Routes} from 'react-router';
import { AppBar, Box, Stack, Toolbar } from '@mui/material';
import { HomePage } from '@/components/Home';
import { NotFoundPage } from '@/components/NotFoundPage';
import { HowToPlay } from '@/components/HowToPlay';
import { Sandbox } from '@/components/Sandbox';
import { FindGame } from '@/components/FindGame';
import { CreateGame } from '@/components/CreateGame';
import { PlayGame } from '@/components/PlayGame';
import messages from '@/translations/en.json';
import { store } from '@/redux/store';
import "@root/app/api/socket-client";

import "./App.css";


const AppFrame = () => {
    return (
        <Stack
            direction="column"
            sx={{
                width: "100%",
                height: "100%",
            }}
        >
            <AppBar position="sticky" sx={{
                marginBottom: "20px",
            }}>
                <Toolbar>
                    Quintro
                </Toolbar>
            </AppBar>
            <Box
                sx={{
                    overflow: "auto",
                }}
            >
                <Outlet/>
            </Box>
        </Stack>
    );
};

export const App = () => {
    return (
        <IntlProvider locale={navigator.language} messages={messages}>
            <Provider store={store}>
                <BrowserRouter>
                    <Routes>
                        <Route element={<AppFrame />}>
                            <Route path="/" element={<HomePage />}/>
                            <Route path="/game/find" element={<FindGame />} />
                            <Route path="/game/create" element={<CreateGame />} />
                            <Route path="/game/play/:gameName" element={<PlayGame />} />
                            <Route path="/how-to-play" element={<HowToPlay />} />
                            <Route path="/sandbox" element={<Sandbox />} />
                            <Route element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </Provider>
        </IntlProvider>
    );
};
