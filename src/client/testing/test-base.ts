import { test as testBase } from 'vitest'
import { worker } from './browser-mock';
 
export const test = testBase.extend({
  worker: [
    async ({}, use) => {
      await use(worker); // Provide worker to test context
    },
    {
      auto: true,
    }
  ],
});