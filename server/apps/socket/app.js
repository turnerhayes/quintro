"use strict";

const path          = require("path");

require("dotenv").config({
	path: path.resolve(__dirname, "..", "..", "..", ".env")
});

const fs            = require("fs");
const assert        = require("assert");
const spdy          = require("spdy");
const express       = require("express");
const cookieParser  = require("cookie-parser");
const rfr           = require("rfr");
const rfrProject    = require("rfr")({
	root: path.resolve(__dirname, "..", "..", "..")
});
const Config        = rfrProject("server/lib/config");
const passportAuth  = rfrProject("server/lib/passport");
const SocketManager = rfr("lib/socket-manager");
// Make sure to set up the default Mongoose connection
rfrProject("server/persistence/db-connection");


exports = module.exports = function(app, server) {
	assert(
		(app && server) ||
		(!app && !server),
		"You must pass both an app and server instance, or neither"
	);

	if (!app) {
		app = express();
		
		app.use(cookieParser(Config.session.secret));

		passportAuth(app);

		if (!server) {
			const options = {
				key: fs.readFileSync(Config.app.ssl.key),
				cert: fs.readFileSync(Config.app.ssl.cert)
			};

			server = spdy.createServer(options, app);
		}
	}

	SocketManager.initialize({
		server
	});

	return {
		app,
		server
	};
};
