#!/usr/bin/nodejs

"use strict";

require("dotenv").config();

const debug            = require("debug")("quintro:socket:server");
const createSocketsApp = require("../app");

const { server, app } = createSocketsApp();

const DEFAULT_PORT = 7300;

const port = Number(process.env.QUINTRO_SOCKET_PORT) || DEFAULT_PORT;

app.set("port", port);

server.listen(
	port,
	function() {
		debug("Socket server listening on secure port " + server.address().port);
	}
);
