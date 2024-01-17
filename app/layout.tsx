// TODO: https://github.com/formatjs/formatjs/pull/4316 should allow IntlProvider in server components;
// once that is in react-intl, we can eliminate this pragma
"use client";

import {IntlProvider} from "react-intl";
import StoreProvider from "@app/redux/StoreProvider";
import TopNavigation from "@app/components/TopNavigation";
import en from "./translations/en.json";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <StoreProvider>
        <IntlProvider
          messages={en}
          locale={navigator.language}
          defaultLocale="en"
        >
          <html lang="en">
            <body>
              <header
                className={"main-header"}
              >
                <TopNavigation
                />
              </header>
              <article
                className={"main-content"}
              >
                {children}
              </article>
            </body>
          </html>
        </IntlProvider>
      </StoreProvider>
    )
  }