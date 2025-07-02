import { SessionData } from 'express-session';
import {
    ColumnType,
    Generated,
    Insertable,
    JSONColumnType,
    Selectable,
    Updateable,
} from 'kysely';

export interface UserTable {
    id: Generated<number>;
    password: string;
    email: string;
    display_name: string;
    created_at: Generated<Date>;
}

export interface PlayerTable {
    id: Generated<number>; // Unique player ID
    game_name: string; // Foreign key to the game table
    color: string; // Color of the player
    user_id: number | null; // Foreign key to the user table, null if an anonymous user 
    index: number; // Index of the player in the game
    session_id: string;
}

export interface GameTable {
    name: string; // Game ID
    winner_index: number | null; // Index of the winner player, null if no winner yet
    player_limit: number; // Maximum number of players allowed
    board_width: number; // Width of the game board
    board_height: number; // Height of the game board
    board_filled_cells: JSONColumnType<Array<{
        position: { x: number; y: number }; // Position of the marble
        color: string; // Color of the marble
    }>>; // Array of filled cells on the board
    created_at: Generated<Date>; // Timestamp when the game was created
    started_at: Date | null; // Timestamp when the game started
    ended_at: Date | null; // Timestamp when the game ended
}

export interface SessionTable {
    id: Generated<string>;
    data: JSONColumnType<SessionData>;
}

export interface Database {
    games: GameTable; // Table for games
    users: UserTable; // Table for users
    players: PlayerTable; // Table for players
    sessions: SessionTable; // Table for sessions
}

export type Game = Selectable<GameTable>;
export type Player = Selectable<PlayerTable>;
export type User = Selectable<UserTable>;
export type Session = Selectable<SessionTable>;

export type NewGame = Insertable<GameTable>;
export type NewPlayer = Insertable<PlayerTable>;
export type NewUser = Insertable<UserTable>;
export type NewSession = Insertable<SessionTable>;

export type UpdateGame = Updateable<GameTable>;
export type UpdatePlayer = Updateable<PlayerTable>;
export type UpdateUser = Updateable<UserTable>;
export type UpdateSession = Updateable<SessionTable>;
