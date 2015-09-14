"use strict";

var express       = require('express');
var assert        = require('assert');
var http          = require('http');
var session       = require('../../session');
var SocketManager = require('../../lib/socket-manager'); 

exports = module.exports = function getApp(options) {
	var app;
	var server = options.server;
	options = options || {};

	app = express();

	if (!server) {
		server = http.createServer(app);
	}
	
	SocketManager.initialize({
		server: server,
	});

	return app;
};
