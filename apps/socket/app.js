"use strict";

var assert        = require('assert');
var http          = require('http');
var fs            = require('fs');
var path          = require('path');
var express       = require('express');
var logger        = require('morgan');
var SocketManager = require('../../lib/socket-manager');
var config        = require('../../lib/utils/config-manager');


exports = module.exports = {
	get: function(app, server) {
		assert(
			(app && server) ||
			(!app && !server),
			"You must pass both an app and server instance, or neither"
		);

		if (!app) {
			app = express();

			if (!server) {
				server = http.createServer(app);
			}

			var loggingArgs = {};

			if (!config.app.logging.useConsole) {
				loggingArgs.stream = fs.createWriteStream(path.join(config.paths.logs, 'access.log'), {flags: 'a'});
			}

			app.use(
				logger(
					config.app.logging.format || 'combined',
					loggingArgs
				)
			);
		}


		SocketManager.initialize({
			server: server,
		});

		return {
			app: app,
			server: server
		};
	}
};
