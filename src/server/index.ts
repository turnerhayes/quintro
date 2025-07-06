import "@/server/read-env";
import { createServer } from "node:http";
import express from "express";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import cors from "cors";
import passport from "passport";
import { Server } from "socket.io";

import SocketManager from "@/server/socket-manager";
import gamesRouter from "@/server/routes/games";
import authRouter from "@/server/routes/auth";
import sessionMiddleware from "@/server/session-middleware";


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
        origin: "http://localhost:5173", //TODO: Get origin from environment variables
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
  origin: "http://localhost:5173", //TODO: Get origin from environment variables
  credentials: true,
}));

app.use('/api/games', gamesRouter);

app.use("/auth", authRouter);

const PORT = 8070; //TODO: Get port from environment

httpServer.listen(PORT, () => {
    console.log("Listening on port", PORT);
});