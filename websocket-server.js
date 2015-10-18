"use strict";

var appUtils = require('./lib/utils/app');

process.on('unhandledException', function(ex) {
	appUtils.logFatalException(
		ex,
		"logs/websocket-server-crash.log",
		function() {
			process.exit(1);
		}
	);
});

var mongoose      = require('mongoose');
var log           = require('log4js');
var debug         = require('debug')('quintro:websockets');
var getSocketApp  = require('./apps/socket/app').get;
var MongoUtils    = require('./lib/utils/mongo');
var config        = require('./lib/utils/config-manager');
var setupPassport = require('./passport-authentication');

mongoose.set('debug', process.env.DEBUG_DB);
mongoose.connect(config.mongo.url || MongoUtils.getConnectionString(config.mongo));

log.configure(config.log4js);

var socketApp = getSocketApp();

setupPassport(socketApp.app);

function _onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error('Port ' + config.websockets.port + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error('Port ' + config.websockets.port + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

function _onListening() {
	var addr = socketApp.server.address();
	var bind = typeof addr === 'string' ?
		'pipe ' + addr :
		'port ' + addr.port;
	debug('Listening on ' + bind);
}

socketApp.app.use(function(req, res) {
	var err = new Error('Not Found');
	err.status = 404;
	res.json(err);
});

socketApp.server.on('error', _onError);
socketApp.server.on('listening', _onListening);

socketApp.server.listen(config.websockets.port);
