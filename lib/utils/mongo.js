"use strict";

var _             = require('lodash');
var configManager = require('../../lib/utils/config-manager');

exports = module.exports = Object.create(Object.prototype, {
	getConnectionString: {
		enumerable: true,
		value: function(config, credentials) {
			var conn = 'mongodb://';

			if (!credentials) {
				credentials = configManager.credentials.mongodb;
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