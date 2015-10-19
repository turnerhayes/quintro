"use strict";

var _             = require('lodash');

exports = module.exports = Object.create(Object.prototype, {
	getConnectionString: {
		enumerable: true,
		value: function(config, credentials) {
			var conn = 'mongodb://';

			if (credentials && credentials.username) {
				console.log('typeof credentials.username: ', typeof credentials.username);
				conn += credentials.username + ':' + credentials.password + '@';
			}

			conn += config.host;

			if (config.port) {
				conn += ':' + config.port;
			}

			conn += '/'+ config.database;

			return conn;
		}
	}
});