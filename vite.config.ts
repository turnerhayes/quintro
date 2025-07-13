import './src/server/read-env';
import path from 'node:path';
import fs from 'node:fs';
import type { ServerOptions } from 'node:https';
import { defineConfig } from 'vite';
import { reactRouter } from "@react-router/dev/vite";
import checker from 'vite-plugin-checker';

const sslCertPath = process.env.SSL_CERT_PATH;
const sslKeyPath = process.env.SSL_KEY_PATH;
const sslCert = Boolean(sslCertPath) ? fs.readFileSync(path.resolve(sslCertPath!)) : null;
const sslKey = Boolean(sslKeyPath) ? fs.readFileSync(path.resolve(sslKeyPath!)) : null;

let httpsConfig: ServerOptions|undefined = undefined;
if (sslCert != null && sslKey != null) {
  httpsConfig = {
    cert: sslCert,
    key: sslKey,
  };
}

// https://vite.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, "src/client"),
  build: {
    outDir: '../../dist/client',
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
    reactRouter(),
    checker({
      typescript: true,
    }),
  ],
});
