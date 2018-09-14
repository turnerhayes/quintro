"use strict";

const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const APP_PATH = path.join(PROJECT_ROOT, "app");
const DIST_PATH = path.join(PROJECT_ROOT, "dist");
const SHARED_LIB_PATH = path.join(PROJECT_ROOT, "shared-lib");
const SERVER_PATH = path.join(PROJECT_ROOT, "server");

exports = module.exports = {
	PROJECT_ROOT: PROJECT_ROOT,
	APP_PATH: APP_PATH,
	DIST_PATH: DIST_PATH,
	SHARED_LIB_PATH: SHARED_LIB_PATH,
	SERVER_PATH: SERVER_PATH,
};
