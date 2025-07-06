import { resolve } from 'node:path';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenv.config({
    path: resolve(__dirname, '../../.env'),
}));
