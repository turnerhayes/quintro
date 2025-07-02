import { join } from "node:path";
import { config } from "dotenv";
config({
    path: join(__dirname, "..", ".env"),
});

import assert from "node:assert";
import session, { SessionOptions } from "express-session";
import SessionStore from "./persistence/session-store";

const sessionSecret = process.env.SESSION_SECRET;

assert(sessionSecret, "No SESSION_SECRET found; set a secret in your environment");

const sess: SessionOptions = {
    secret: sessionSecret,
    store: new SessionStore(),
    resave: false,
    saveUninitialized: true,
};

export default session(sess);
