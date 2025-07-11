import "@/server/read-env";
import { createServer } from "node:http";
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

interface SocketRequest extends Request {
    _query: {
        sid: string;
    };
}

function onlyForHandshake(middleware: RequestHandler) {
  return (req: SocketRequest, res: Response, next: NextFunction) => {
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}


const app = express();
const httpServer = createServer(app);

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
    debug("Listening on port %d", Config.api.port);
});
