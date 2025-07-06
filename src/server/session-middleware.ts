import "@/server/read-env";
import assert from "node:assert";
import session from "express-session";
import type { SessionOptions } from "express-session";
import SessionStore from "@/server/persistence/session-store";

const sessionSecret = process.env.SESSION_SECRET;

assert(sessionSecret, "No SESSION_SECRET found; set a secret in your environment");

const sess: SessionOptions = {
    secret: sessionSecret,
    store: new SessionStore(),
    resave: false,
    saveUninitialized: true,
};

export default session(sess);
