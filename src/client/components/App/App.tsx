import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { ClientApp } from '@/client/components/App/ClientApp';
import messages from '@/client/translations/en.json';
import "@/client/api/socket-client.client";

import "./App.css";


const theme = createTheme({
    colorSchemes: {
        dark: true,
    },
});

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
