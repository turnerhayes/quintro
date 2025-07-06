import "../read-env"; // Don't use @/ prefix; this is used by kysely and that doesn't seem to work with aliases
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';

const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: process.env.DB_CREDENTIALS_URL,
    }),
});

export default dialect;