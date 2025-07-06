import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { Box, createTheme, ThemeProvider } from '@mui/material';
import messages from '@/translations/en.json';
import { store } from '@/redux/store';
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
                defaultLocale='en'
                messages={messages}
            >
                <Provider store={store}>
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
                </Provider>
            </IntlProvider>
        </ThemeProvider>
    );
};
