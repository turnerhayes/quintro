import path from 'node:path';
import { defineConfig } from 'vite';
import { reactRouter } from "@react-router/dev/vite";
import checker from 'vite-plugin-checker';

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
  plugins: [
    reactRouter(),
    checker({
      typescript: true,
    }),
  ],
});
