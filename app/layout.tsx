import { Provider } from "react-redux";
import {store} from "./redux";
import StoreProvider from "./redux/StoreProvider";

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <StoreProvider>
        <html lang="en">
          <body>{children}</body>
        </html>
      </StoreProvider>
    )
  }