// TODO: https://github.com/formatjs/formatjs/pull/4316 should allow IntlProvider in server components;
// once that is in react-intl, we can eliminate this pragma
"use client";

import { IntlProvider } from "react-intl";

import TopNavigation from "@app/containers/TopNavigation";
import en from "./translations/en.json";
import { SessionProvider } from "next-auth/react";
import App from "./App";


const AppWrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    const locale = global.navigator?.language || "en-US";

    return (
        <SessionProvider>
            <IntlProvider
                messages={en}
                locale={locale}
                defaultLocale="en"
            >
                <App
                    locale={locale}
                >
                    {children}
                </App>
            </IntlProvider>
        </SessionProvider>
    );
}

export default AppWrapper;
