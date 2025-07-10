"use client";

// This file is used as a workaround for an import issue with Vite's SSR. For some reason, when Vite creates
// a virtual module for its SSR, it imports the `redux-persist/lib/storage` module without esModuleInterop,
// so instead of importing the default export, it imports the entire module (i.e. `{default: {
// getItem(); setItem();}}` rather than `{getItem(); setItem();}`). This wrapper ensures that we get the
// default export in that case.
import storageImport from 'redux-persist/lib/storage';

export const storage = "default" in storageImport ? storageImport.default as typeof storageImport : storageImport;
