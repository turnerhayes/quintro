"use strict";

var path            = require('path');
var mongoose        = require('mongoose');
var log             = require('log4js');
var debug           = require('debug')('quintro:websockets');
var socketApp       = require('./apps/socket/app');
var MongoUtils      = require('./lib/mongo-utils');
var websocketConfig = require('./config/websockets');
var mongoConfig     = require('./config/mongo');
var setupPassport   = require('./passport-authentication');

mongoose.set('debug', process.env.DEBUG_DB);
mongoose.connect(MongoUtils.getConnectionString(mongoConfig));

log.configure(path.join(__dirname, 'config', 'log4js.json'));

setupPassport(socketApp.app);

function _onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error('Port' + websocketConfig.port + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error('Port' + websocketConfig.port + ' is already in use');
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

socketApp.server.listen(websocketConfig.port);
