"use server";

// Largely taken from https://blog.geogo.in/setting-up-socket-io-with-next-js-13-real-time-communication-in-your-web-application-8c95cf17e0c

import {Server as HTTPServer} from "node:http";
import {Socket as NetSocket} from "node:net";
import { NextApiRequest, NextApiResponse } from "next";
import {Server as IOServer} from "socket.io";
import {websockets as WebsocketsConfig} from "@shared/config";

interface SocketServer extends HTTPServer {
    io: IOServer;
}

interface IOSocket extends NetSocket {
    server: SocketServer;
}

interface SocketResponse extends NextApiResponse {
    socket: IOSocket;
}

const SocketHandler = (req: NextApiRequest, res: SocketResponse) => {
    if (res.socket.server.io) {
        res.status(200).json({
            message: "Socket server already running",
        });
        return;
    }
    console.log("Creating Socket.IO server with path /api/socket");
    const io = new IOServer({
        path: "/api/socket",
        addTrailingSlash: false,
    });

    io.on("connect", (socket) => {
        console.log("socket:", socket);
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket);
        })
    });

    res.socket.server.io = io;
    res.status(201).send({message: "Socket.io server started"});
}

export default SocketHandler;
