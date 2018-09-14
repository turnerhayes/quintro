"use strict";

const path          = require("path");
const debug         = require("debug")("quintro:apps:socket");
const PROJECT_ROOT  = path.resolve(__dirname, "..", "..", "..");

require("dotenv").config({
	path: path.join(PROJECT_ROOT, ".env")
});

const fs            = require("fs");
const spdy          = require("spdy");
const express       = require("express");
const cookieParser  = require("cookie-parser");
const Config        = require("./lib/config");
const SocketManager = require("./lib/socket-manager");
const passportAuth  = require(path.join(Config.paths.server, "middlewares/passport"));
// Make sure to set up the default Mongoose connection
require(path.join(Config.paths.server, "persistence/db-connection"));


exports = module.exports = function createSocketsApp(server) {
	debug("Starting socket server");
	const app = express();
	
	app.use(cookieParser(Config.session.secret));

	passportAuth(app);

	if (!server) {
		const options = {
			key: fs.readFileSync(Config.app.ssl.key),
			cert: fs.readFileSync(Config.app.ssl.cert)
		};

		server = spdy.createServer(options, app);
	}

	SocketManager.initialize({
		server
	});

	return {
		app,
		server
	};
};
