import "@/server/read-env";
import { createServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import type { ServerOptions } from "node:https";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import cors from "cors";
import passport from "passport";
import { Server } from "socket.io";
import createDebugger from "debug";

import Config from "@/config";
import SocketManager from "@/server/socket-manager";
import gamesRouter from "@/server/routes/games";
import authRouter from "@/server/routes/auth";
import sessionMiddleware from "@/server/session-middleware";


const debug = createDebugger("quintro:server");

const sslCertFile = process.env.SSL_CERT_PATH || "";
const sslKeyFile = process.env.SSL_KEY_PATH || "";

const projectRoot = path.resolve(__dirname, "..", "..");

const sslCert = sslCertFile ? fs.readFileSync(path.resolve(projectRoot, sslCertFile)) : null;
const sslKey = sslKeyFile ? fs.readFileSync(path.resolve(projectRoot, sslKeyFile)) : null;

const httpsConfig: ServerOptions|null = sslCert != null ? {
  cert: sslCert,
  key: sslKey,
} : null;

interface SocketRequest extends Request {
    _query: {
        sid: string;
    };
}

function onlyForHandshake(middleware: RequestHandler) {
  return (req: SocketRequest, res: Response, next: NextFunction) => {
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      middleware(req as Request, res, next);
    } else {
      next();
    }
  };
}


const app = express();
let httpServer = httpsConfig == null ? createServer(app) : createHttpsServer(httpsConfig, app);

const io = new Server(httpServer, {
    cors: {
        origin: Config.client.origin,
        credentials: true,
    },
});

io.engine.use(onlyForHandshake(sessionMiddleware));
io.engine.use(onlyForHandshake(passport.session()));

new SocketManager(io);

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cors({
  origin: Config.client.origin,
  credentials: true,
}));

app.use('/api/games', gamesRouter);

app.use("/auth", authRouter);

httpServer.listen(Config.api.port, () => {
    debug("API server available at %s:%s", Config.api.host, Config.api.port);
});
