"use strict";

const app = require("./app");
const auth = require("./auth");
const logging = require("./logging");
const storage = require("./storage");
const session = require("./session");
const sharedConfig = require("../../shared-lib/dist/config");


// "fake" document object so that shared-config can access it when not run from the
// client (as it's doing here)
global.document = {
	origin: app.address.origin,
};

const Config = {
	...sharedConfig,
	app,
	auth,
	storage,
	session,
	logging,
};

module.exports = Config;
