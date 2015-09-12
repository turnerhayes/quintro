"use strict";

var config = {
	host: 'some.host',
	port: undefined,
	database: 'qunitro'
};

Object.defineProperties(
	config,
	{
		connectionString: {
			enumerable: true,
			get: function() {
				var conn = 'mongodb://' + config.host;

				if (!config.port) {
					conn += ':' + config.port;
				}

				conn += '/'+ config.database;

				return conn;
			}
		}
	}
);

module.exports = config;
