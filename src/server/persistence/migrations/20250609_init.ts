import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('users').ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('password', 'varchar')
        .addColumn('email', 'varchar', (col) => col.notNull().unique())
        .addColumn('display_name', 'varchar', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) =>
            col.defaultTo(sql`now()`).notNull(),
        )
        .execute();

    await db.schema
        .createTable('games').ifNotExists()
        .addColumn('name', 'varchar(10)', (col) => col.primaryKey())
        .addColumn('winner_index', 'integer')
        .addColumn('board_width', 'smallint', (col) => col.notNull())
        .addColumn('board_height', 'smallint', (col) => col.notNull())
        .addColumn(
            'board_filled_cells',
            'json',
            (col) =>
                col
                    .notNull()
        )
        .addColumn('player_limit', 'smallint', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) =>
            col.defaultTo(sql`now()`).notNull(),
        )
        .addColumn('started_at', 'timestamp')
        .addColumn('ended_at', 'timestamp')
        .execute();

    await db.schema
        .createTable('players').ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('color', 'varchar', (col) => col.notNull())
        .addColumn('game_name', 'varchar', (col) =>
            col.references('games.name').onDelete('cascade').notNull()
        )
        .addColumn('index', 'smallint', (col) => col.notNull())
        .addUniqueConstraint('unique_game_index', ['game_name', 'index'])
        .addColumn('session_id', 'varchar', (col) => col.notNull())
        .addColumn('user_id', 'integer', (col) =>
            col
                .references('users.id')
                .onDelete('set null')
        )
        .execute();

    await db.schema.createTable("sessions").ifNotExists()
        .addColumn('id', 'varchar', (col) => col.primaryKey())
        .addColumn('data', 'json')
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('players').ifExists().execute();
    await db.schema.dropTable('users').ifExists().execute();
    await db.schema.dropTable('games').ifExists().execute();
    await db.schema.dropTable('sessions').ifExists().execute();
}