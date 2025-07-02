import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import path from 'node:path';

import dotenv from 'dotenv';
dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
});

const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: process.env.DB_CREDENTIALS_URL,
    }),
});

export default dialect;