"use strict";

const express = require("express");
const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "..", "..", ".env"),
});

const debug = require("debug")("quintro.api");
const Config = require("../config");
const Loggers = require(path.join(Config.paths.server, "lib", "loggers"));
const connectToDb = require("../persistence/connection");
const gameRouter = require("./routes/games");
const NotFoundException = require("../persistence/exceptions/not-found");

function raise404(req, res, next) {
	const err = new Error("Not Found");
	err.status = 404;
	next(err);
}

const app = express();

if (Config.websockets.inline) {
	const {createServer} = require("http");
	const SocketManager = require("../socket/socket-manager");
	const httpServer = createServer(app);
	SocketManager.initialize({
		server: httpServer,
	});
}

app.use("/games", gameRouter);


/// catch 404 and forwarding to error handler
app.use(raise404);

/// error handlers

// Express uses the arity of the handler function to determine whether this is
// an error handler, so it needs to take 4 arguments
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
    let status = err.status || 500;

    if (NotFoundException.isThisException(err)) {
        status = 404;
    }
	res.status(status);

	const errData = {
        message: err.message,
        stack: Config.app.isDevelopment ? err.stack : null,
	};

	if (status !== 404) {
		Loggers.error(err);
	}

	res.format({
		json: () => res.json(errData),
		// TODO: Provide error page
		default: () => res.json(errData)
	});
});

const port = Config.api.port;
console.log("API port: ", Config.api);

connectToDb().then(() => {
	app.listen(port, () => {
		debug(`API server listening on port ${port}`);
	});
});
