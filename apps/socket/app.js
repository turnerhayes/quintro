"use strict";

var express       = require('express');
var http          = require('http');
var SocketManager = require('../../lib/socket-manager');

var app = express();

var server = http.createServer(app);

SocketManager.initialize({
	server: server,
});

exports = module.exports = {
	app: app,
	server: server
};
