import { setupWorker } from 'msw/browser';
import { handlers } from './service-mocks';
 
export const worker = setupWorker(...handlers);
