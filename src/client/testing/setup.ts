import.meta.env.RTL_SKIP_AUTO_CLEANUP = true
import { cleanup } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { gamesApi } from '@/client/api/games';
import { resetStore } from '@/client/redux/store';
import { worker } from '@/client/testing/browser-mock';
import { getStore } from '@/client/redux/store';

async function setup() {
    await worker.start({
        quiet: true,
        onUnhandledRequest(req, print) {
            const { pathname } = new URL(req.url);

            if (
                pathname.endsWith('.css') ||
                pathname.endsWith('.png') ||
                pathname.endsWith('.jpg') ||
                pathname.endsWith('.gif') ||
                pathname.endsWith('.svg') ||
                pathname.endsWith('.woff2') ||
                pathname.endsWith('.ts') ||
                pathname.endsWith('.tsx') ||
                pathname.endsWith('translations/en.json') ||
                pathname.includes("/socket.io/") ||
                pathname.includes("/components/") ||
                pathname.startsWith("/node_modules/") ||
                pathname === '/favicon.ico'
            ) {
                return; // Silently ignore these
            }

            print.warning(); // Warn for everything else
        },
    });
}

setup();

beforeEach(() => {
    const {store} = getStore();
    cleanup();
    worker.resetHandlers();
    resetStore();
    store.dispatch(gamesApi.util.resetApiState());
});
