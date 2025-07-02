import { join, relative } from "node:path";
import { cwd } from "node:process";
import { defineConfig } from 'kysely-ctl';

import dialect from '../src/server/persistence/dialect';


const migrationFolder = join(__dirname, "..", "src", "server", "persistence", "migrations");

export default defineConfig({
	dialect,
	migrations: {
		migrationFolder: relative(cwd(), migrationFolder),
	},
});
