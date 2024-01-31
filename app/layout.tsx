import StoreProvider from "@app/redux/StoreProvider";
import AppWrapper from "./AppWrapper";

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
        <AppWrapper>
          {children}
        </AppWrapper>
      </StoreProvider>
    )
  }