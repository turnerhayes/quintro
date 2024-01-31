const path = require("node:path");
const AppConfig = require("./app");
const {PROJECT_ROOT} = require("./paths");

const LOGS_DIRECTORY = path.resolve(PROJECT_ROOT, process.env.LOGS_DIRECTORY || "logs");

module.exports = {
		error: {
			file: process.env.LOGGING_ERROR_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.LOGGING_ERROR_FILE) :
				null
		},
		access: {
			file: process.env.LOGGING_ACCESS_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.LOGGING_ACCESS_FILE) :
				null
		},
		sql: {
			file: process.env.LOGGING_SQL_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.LOGGING_SQL_FILE) :
				(
					AppConfig.isDevelopment ?
						null :
						false
				)
		},
		websockets: {
			file: process.env.WEB_SOCKETS_LOGGING_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.WEB_SOCKETS_LOGGING_FILE) :
				null
		}
	};
	