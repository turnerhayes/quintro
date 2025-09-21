import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ClientApp } from '@/client/components/App/ClientApp';
import messages from '@/client/translations/en.json';
import "@/client/api/socket-client.client";
import {theme} from "@/client/components/App/theme";

import "./App.css";



export const App = (
    {
        children,
    }: {
        children: ReactNode|ReactNode[];
    }
) => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <IntlProvider
                locale={navigator.language}
                defaultLocale='en-US'
                messages={messages}
            >
                <ClientApp>
                    {children}
                </ClientApp>
            </IntlProvider>
        </ThemeProvider>
    );
};
