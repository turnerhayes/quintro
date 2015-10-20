"use strict";

var _     = require('lodash');
var debug = require('debug')('quintro:config');
var util  = require('util');

var log4jsConsoleConfig = require('../../config/log4js.console');

var config = {
	app: {
		environment: process.env.ENVIRONMENT,

		secret: process.env.APP_SECRET,

		logging: {
			format: process.env.LOGGING_FORMAT,

			useConsole: !!process.env.LOGGING_USE_CONSOLE
		},

		session: {
			key: process.env.SESSION_KEY,

			store: {
				url: process.env.SESSION_STORE_URI
			}
		},

		address: {
			isSecure: process.env.APP_ADDRESS_IS_SECURE,

			host: process.env.APP_ADDRESS_HOST,

			// We allow the port to be overridden with an environment
			// variable whether USE_ENVIRONMENT_CONFIG is set or not
			port: process.env.PORT || process.env.APP_ADDRESS_PORT,

			externalPort: process.env.APP_ADDRESS_EXTERNAL_PORT
		}
	},

	mongo: {
		url: process.env.DATA_DB_URI
	},

	websockets: {
		url: process.env.WEB_SOCKETS_URI,

		inline: !!process.env.WEB_SOCKETS_INLINE
	},

	paths: require('../../config/paths'),

	authentication: require('../../config/authentication'),

	credentials: {
		facebook: {
			appSecret: process.env.CREDENTIALS_FACEBOOK_SECRET,

			appID: process.env.CREDENTIALS_FACEBOOK_APPID
		}
	}	
};

if (config.websockets.inline) {
	_.extend(config.websockets, {
		host: config.app.address.host,
		port: config.app.address.port,
		externalPort: config.app.address.externalPort,
		isSecure: config.app.address.isSecure
	});
}

if (config.app.logging.useConsole) {
	config.log4js = log4jsConsoleConfig;
}
else {
	try {
		config.log4js = JSON.parse(process.env.LOG4JS_CONFIG_STRING);
	}
	catch(ex) {}
}

debug(
	'Configuration: \n',
	util.inspect(config)
);

exports = module.exports = config;
