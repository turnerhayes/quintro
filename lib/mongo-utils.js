"use strict";

var _                 = require('lodash');
var credentialsConfig = require('../config/credentials');

exports = module.exports = Object.create(Object.prototype, {
	getConnectionString: {
		enumerable: true,
		value: function(config, credentials) {
			var conn = 'mongodb://';

			if (!credentials) {
				credentials = credentialsConfig.mongodb;
			}

			if (!_.isNull(credentials.username)) {
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