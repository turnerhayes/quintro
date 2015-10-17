"use strict";

var http          = require('http');
var fs            = require('fs');
var path          = require('path');
var express       = require('express');
var logger        = require('morgan');
var SocketManager = require('../../lib/socket-manager');
var config        = require('../../lib/utils/config-manager');

var app = express();

var server = http.createServer(app);

app.use(
	logger(
		config.app.logging.format || 'combined',
		{
			stream: fs.createWriteStream(
				path.join(config.paths.logs, 'websocket-access.log'), {flags: 'a'}
			)
		}
	)
);

SocketManager.initialize({
	server: server,
});

exports = module.exports = {
	app: app,
	server: server
};
