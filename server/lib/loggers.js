"use strict";

const winston = require("winston");
const morgan  = require("morgan");
const Config  = require("../config");

// eslint-disable-next-line no-magic-numbers
const MAX_LOG_SIZE_BYTES = 10 * 1000 * 1000; // 10MB

let sqlLogger;

if (Config.logging.sql.file !== false) {
	const logger = new winston.Logger({
		level: "info"
	});

	if (Config.logging.sql.file === null) {
		logger.add(new winston.transports.Console());
	}
	else {
		logger.add(
			new winston.transports.File(
				{
					filename: Config.logging.sql.file,
					timestamp: true,
					maxsize: MAX_LOG_SIZE_BYTES
				})
		);
	}

	sqlLogger = function(msg) {
		logger.info(msg);
	};
}

const websocketsLogger = winston.createLogger({
	levels: winston.config.npm.levels,
	format: winston.format.json(),
});

if (Config.logging.websockets.file === null) {
	websocketsLogger.add(new winston.transports.Console());
}
else {
	websocketsLogger.add(
		new winston.transports.File(
			{
				filename: Config.logging.websockets.file,
				timestamp: true,
				maxsize: MAX_LOG_SIZE_BYTES
			})
	);
}

const errorLogger = new winston.Logger({
	level: "error",
	transports: [
		new winston.transports.Console({
			timestamp: true
		})
	]
});

module.exports.http = morgan("dev");
module.exports.sql = sqlLogger;
module.exports.error = errorLogger.error;
module.exports.websockets = websocketsLogger;
