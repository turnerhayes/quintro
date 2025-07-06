import { SessionData, Store } from "express-session";
import db from "./db";
import { sql } from "kysely";


type LengthErrorCallback = (err: any) => void;
type LengthValueCallback = (err: null, len: number) => void

type LengthCallback = LengthErrorCallback & LengthValueCallback;

const isNotExpired = (result: {data: any;}): boolean => {
    if (result.data?.cookie?.expires) {
        const ms = Number(new Date(result.data.cookie.expires)) - Date.now();
        const ttl = Math.ceil(ms/1000);

        return ttl > 0;
    }

    return true;
};

class SessionStore extends Store {
    async clearExpiredSessions(): Promise<void> {
        const query = db.deleteFrom("sessions")
            .where(sql`${sql.ref('data')}->${sql.lit('cookie')}->${sql.lit('expires')}`, 'is not', null)
            .where(sql`to_timestamp((${sql.ref('data')}->${sql.lit('cookie')}->>${sql.lit('expires')})::int)`, "<=", sql`CURRENT_TIMESTAMP`);
        console.log("query:", query.compile().sql);
        await query.execute();
    }

    async all(callback: (err: any, sessions?: SessionData[]) => void): Promise<SessionData[]> {
        try {
            const results = await db.selectFrom("sessions")
                .select("data")
                .execute();
            
            const filteredResults = results.filter(isNotExpired).map(({data}) => data);
            callback(null, filteredResults);
            return filteredResults;
        }
        catch(err) {
            callback(err);
            throw err;
        }
    }

    async clear(callback: (err: any) => void): Promise<void> {
        try {
            await db.deleteFrom("sessions")
                .execute();
            callback(null);
        }
        catch (err) {
            callback(err);
            throw err;
        }
    }

    async length(callback: LengthCallback): Promise<number> {
        try {
            const result = await db.selectFrom("sessions")
                .select(({fn}) => fn.countAll().as("session_count"))
                .executeTakeFirst();
            
            const count = Number(result?.session_count) ?? 0;
            callback(null, count);
            return count;
        }
        catch (err) {
            callback(err);
            throw err;
        }
    }

    async get(sid: string, callback: (err: any, session?: SessionData | null) => void): Promise<SessionData|null> {
        try {
            const result = await db.selectFrom("sessions")
                .select([
                    "id",
                    "data",
                ]).where("id", "=", sid)
                .executeTakeFirst();
            if (!result) {
                callback(null, null);
                return null;
            }
            let data: any|null = result.data;
            console.log("Got session for session ID %s", sid);
            if (!isNotExpired(data)) {
                console.log("Session is expired; deleting");
                await this.destroy(sid);
                callback(null, null);
                return null;
            }
            callback(null, data);
            return data;
        }
        catch(err) {
            callback(err);
            throw err;
        }
    }
    async set(sid: string, session: SessionData, callback?: (err?: any) => void): Promise<void> {
        try {
            const val = JSON.stringify(session);
            await db.insertInto("sessions").values({
                id: sid,
                data: val,
            }).onConflict((oc) => oc.column('id').doUpdateSet(
                ({ref}) => ({
                    data: ref('excluded.data'),
                })
            )).execute();
            callback?.(null);
            return;
        }
        catch (err) {
            callback?.(err);
            throw err;
        }
    }
    async destroy(sid: string, callback?: (err?: any) => void): Promise<void> {
        try {
            await db.deleteFrom("sessions")
                .where("id", "=", sid)
                .execute();
        }
        catch(err) {
            callback?.(err);
            throw err;
        }
    }

}

export default SessionStore;
