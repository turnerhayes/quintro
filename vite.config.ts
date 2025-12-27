/// <reference types="vitest/config" />
import './src/server/read-env';
import path from 'node:path';
import fs from 'node:fs';
import type { ServerOptions } from 'node:https';
import { defineConfig } from 'vite';
import { reactRouter } from "@react-router/dev/vite";
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

const sslCertPath = process.env.SSL_CERT_PATH;
const sslKeyPath = process.env.SSL_KEY_PATH;
const sslCert = Boolean(sslCertPath) ? fs.readFileSync(path.resolve(sslCertPath!)) : null;
const sslKey = Boolean(sslKeyPath) ? fs.readFileSync(path.resolve(sslKeyPath!)) : null;

let httpsConfig: ServerOptions|undefined = undefined;
if (!process.env.VITEST && sslCert != null && sslKey != null) {
  httpsConfig = {
    cert: sslCert,
    key: sslKey,
  };
}

// https://vite.dev/config/
export default defineConfig({
  // root: path.resolve(__dirname, "src/client"),
  root: __dirname,
  publicDir: './src/client/public',
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    https: httpsConfig,
  },
  plugins: [
    tsconfigPaths(),
    !process.env.VITEST && reactRouter(),
    checker({
      typescript: true,
    }),
  ],
  
  test: {
    env: {
      VITE_IS_API_SECURE: "",
    },
    include: [
      "./src/client/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "./src/client/testing/**",
    ],
    setupFiles: [
      './src/client/testing/setup.ts',
    ],
    browser: {
      provider: 'playwright',
      enabled: true,
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
      ],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/**',
      ],
      exclude: [
        "src/client/components/**/index.ts",
        "src/client/testing/**",
        "src/server/**",
        "src/client/**/*.test.{ts,tsx}",
      ],
    },
  },
});
