#!/usr/bin/nodejs

"use strict";

require("dotenv").config();

const debug           = require("debug")("quintro:socket:server");
const path            = require("path");
const rfr             = require("rfr");
const rfrProject      = require("rfr")({
	root: path.resolve(__dirname, "..", "..", "..", "..")
});
const appGenerator    = rfr("app");
const Config          = rfrProject("server/lib/config");

const  { server } = appGenerator();

server.listen(
	Config.websockets.port,
	function() {
		debug("Socket server listening on secure port " + server.address().port);
	}
);
