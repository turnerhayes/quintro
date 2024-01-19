const path = require("path");
const pathConfig = require("../config/paths");
require("dotenv").config({
    path: path.join(pathConfig.PROJECT_ROOT, ".env"),
});

const {createServer} = require("node:http");
const SocketManager = require("./socket-manager");
const Config = require("../config");
const Loggers = require("../lib/loggers");
const connectToDb = require("../persistence/connection");
const session = require("../lib/session");

const port = Config.websockets.port;

connectToDb().then(() => {
    const httpServer = createServer();

    const manager = new SocketManager();
    
    manager.attachTo(httpServer);
    manager._server.engine.use(session);
    
    httpServer.listen(port, () => {
        Loggers.websockets.log("info", "HTTP server for sockets listening on port " + port);
    });
});
