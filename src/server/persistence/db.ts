import { Kysely, type LogConfig } from "kysely";
import type { Database } from "./types";

import dialect from "./dialect";

const logLevels: LogConfig = process.env.ENVIRONMENT === "production" ? ["error"] : ["query", "error"];

const db = new Kysely<Database>({
    dialect,
    log: logLevels,
});

export default db;
