import {Socket, io} from "socket.io-client";
import Config from "@app/config";

const GameSocketClient = () => {
    const socket = io(Config.websockets.url, {
        path: "/api/socket",
        addTrailingSlash: false,
        withCredentials: true,
    });

    socket.on("connect", () => {
        console.log("Connected");
    });

    socket.on("disconnect", () => {
        console.log("Disconnected");
    });

    socket.on("connect_error", async err => {
        console.log(`connect_error due to ${err.message}`);
        await fetch("/api/socket");
    });
    
    return socket;
};

export default GameSocketClient;
