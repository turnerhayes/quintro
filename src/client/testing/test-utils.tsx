import React, { useEffect, useState, type ReactElement, type ReactNode} from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { beforeEach, afterEach } from 'vitest';
import { IntlProvider } from 'react-intl';
import { createMemoryRouter, MemoryRouter, RouterProvider, type RouteObject, type RouterProviderProps } from 'react-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import type { Storage } from 'redux-persist';

import {theme} from "@/client/components/App/theme";
import { getStore } from '@/client/redux/store';
import messages from "@/client/translations/en.json";
import routes from '@/client/routes';


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

type RouterType = RouterProviderProps['router'];

interface ProviderWrapperProps {
  children: ReactNode;
  initialEntries?: string[];
  initialIndex?: number;
}

export const getProviderWrapper = (
  {
    children,
    initialEntries,
    initialIndex,
  }: ProviderWrapperProps
): [React.ComponentType, RouterType|undefined] => {
  let routerElement = null;
  
  let router: RouterType|undefined;

  if (initialEntries != undefined) {
    const currentPath = initialEntries[initialIndex || 0] || '/';
    router = createMemoryRouter(
      [
        ...routes.map(config => ({
          path: config.path,
          children: config.children,
          index: config.index,
        } as RouteObject)),
        {
          path: currentPath,
          element: children,
        }
      ],
      {
        initialEntries,
        initialIndex,
      }
    );

    routerElement = (
      <RouterProvider
        router={router}
      />
    );
  }
  else {
    routerElement = (
      <MemoryRouter>
        {children}
      </MemoryRouter>
    );
  }

  const wrapperComponent = () => {
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
                {routerElement}
              </IntlProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    );
  };


  return [wrapperComponent, router];
};

const ProviderWrapper = (
  {
    children,
    initialEntries,
    initialIndex,
  }: ProviderWrapperProps
) => {
  const [ Wrapper ] = getProviderWrapper(
    {
      children,
      initialEntries,
      initialIndex,
    }
  );

  return <Wrapper />;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'|'container'>,
) => render(ui, {wrapper: ProviderWrapper, container, ...options});

export const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'|'container'> & {
    initialEntries: string[];
    initialIndex: number;
  },
) => {
  const {initialEntries, initialIndex} = options || {};
  const [ Wrapper, router ] = getProviderWrapper(
    {
      children: ui,
      initialEntries,
      initialIndex,
    }
  );

  return [render(ui, {wrapper: Wrapper, container}), router] as const;
}

export * from '@testing-library/react';
export {customRender as render};
