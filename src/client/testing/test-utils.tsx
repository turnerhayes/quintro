import { useEffect, useState, type ReactElement, type ReactNode} from 'react';
import {render, type RenderOptions} from '@testing-library/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import type { Storage } from 'redux-persist';

import {theme} from "@/client/components/App/theme";
import { getStore } from '@/client/redux/store';
import messages from "@/client/translations/en.json";
import { beforeEach } from 'vitest';
import { afterEach } from 'vitest';


class TestStorage implements Storage {
  private store: {[key: string]: string} = {};

  async getItem(key: string) {
    return this.store[key] ?? null;
  }

  async setItem(key: string, value: any) {
    this.store[key] = value;
  }

  async removeItem(key: string) {
    delete this.store[key];
  }
}

let container: HTMLDivElement|undefined;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  if (container) {
    document.body.removeChild(container);
  }
  container = undefined;
});

const ProviderWrapper = (
  {
    children,
  }: {
    children: ReactNode;
  }
) => {
  // const { store, persistor } = getStore(new TestStorage());
  const [ storeData, setStoreData ] = useState<ReturnType<typeof getStore>>();

  useEffect(
    () => {
      setStoreData(getStore(new TestStorage()));

      return () => {
        setStoreData(undefined);
      };
    },
    []
  );


  if (!storeData) {
    return null;
  }

  return (
    <Provider store={storeData.store}>
      <PersistGate persistor={storeData.persistor!}>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <IntlProvider
                locale="en"
                defaultLocale='en-US'
                messages={messages}
            >
              <MemoryRouter>
                {children}
              </MemoryRouter>
            </IntlProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'|'container'>,
) => render(ui, {wrapper: ProviderWrapper, container, ...options});

export * from '@testing-library/react';
export {customRender as render};
