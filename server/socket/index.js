const path = require("path");
const pathConfig = require("../config/paths");
require("dotenv").config({
    path: path.join(pathConfig.PROJECT_ROOT, ".env"),
});

const {createServer} = require("http");
const SocketManager = require("./socket-manager");
const Config = require("../config");
const Loggers = require("../lib/loggers");
const connectToDb = require("../persistence/connection");

const port = Config.websockets.port;

connectToDb().then(() => {
    SocketManager.initialize({
    });
    
    SocketManager.listen(port).then(() => {
        Loggers.websockets.log("info", "HTTP server for sockets listening on port " + port);
    });
});
