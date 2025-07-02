import { join } from "node:path";
import { config } from "dotenv";
config({
    path: join(__dirname, "..", "..", ".env"),
});
import { Server } from "socket.io";
import { createServer } from "node:http";
import express, { NextFunction, Request, RequestHandler, Response } from "express";
import passport from "passport";
import Config from "@root/config";
import sessionMiddleware from "../session-middleware";
import SocketManager from "./socket-manager";

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

app.use(sessionMiddleware);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:8070", //TODO: Get origin from environment variables
        credentials: true,
    },
});

io.engine.use(onlyForHandshake(sessionMiddleware));
io.engine.use(onlyForHandshake(passport.session()));

new SocketManager(io);

const port = Config.websockets.port;

httpServer.listen(port, () => {
    console.log("Websocket server listening on port", port);
});
