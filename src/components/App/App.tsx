import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { createTheme, ThemeProvider } from '@mui/material';
import { ClientApp } from '@/components/App/ClientApp';
import messages from '@/translations/en.json';
import "@/api/socket-client.client";

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
