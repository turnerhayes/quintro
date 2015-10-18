"use strict";

var _     = require('lodash');
var debug = require('debug')('quintro:config');

var use_env = process.env.USE_ENVIRONMENT_CONFIG;

var log4jsConsoleConfig = require('../../config/log4js.console');
var log4jsConfig = {};
var appConfig = {};
var mongoConfig = {};
var websocketsConfig = {};
var credentialsConfig = {};

if (!use_env) {
	appConfig         = require('../../config/app');
	log4jsConfig      = require('../../config/log4js');
	mongoConfig       = require('../../config/mongo');
	websocketsConfig  = require('../../config/websockets');
	credentialsConfig = require('../../config/credentials');
}

var config = {
	app: {
		environment: use_env ?
			process.env.ENVIRONMENT :
			appConfig.environment,

		secret: use_env ?
			process.env.APP_SECRET :
			appConfig.secret,

		logging: {
			format: use_env ?
				process.env.LOGGING_FORMAT :
				_.get(appConfig, 'logging.format'),

			useConsole: use_env ?
				!!process.env.LOGGING_USE_CONSOLE :
				!!_.get(appConfig, 'logging.useConsole')
		},

		session: {
			key: use_env ?
				process.env.SESSION_KEY :
				_.get(appConfig, 'session.key'),

			store: {
				url: use_env ?
					process.env.SESSION_STORE_URI :
					_.get(appConfig, 'session.store.url'),

				host: _.get(appConfig, 'session.store.host'),

				// We allow the port to be overridden with an environment
				// variable whether USE_ENVIRONMENT_CONFIG is set or not
				port: process.env.PORT || _.get(appConfig, 'session.store.port'),

				username: _.get(appConfig, 'session.store.username'),

				password: _.get(appConfig, 'session.store.password'),

				database: _.get(appConfig, 'session.store.database'),
			}
		},

		address: {
			isSecure: use_env ?
				process.env.APP_ADDRESS_IS_SECURE :
				_.get(appConfig, 'address.isSecure'),

			host: use_env ?
				process.env.APP_ADDRESS_HOST :
				_.get(appConfig, 'address.host'),

			port: use_env ?
				process.env.APP_ADDRESS_PORT :
				_.get(appConfig, 'address.port'),

			externalPort: use_env ?
				process.env.APP_ADDRESS_EXTERNAL_PORT :
				_.get(appConfig, 'address.externalPort')
		}
	},

	mongo: {
		url: use_env ?
			process.env.DATA_DB_URI :
			mongoConfig.url,

		host: mongoConfig.host,

		port: mongoConfig.port,

		database: mongoConfig.database
	},

	websockets: {
		url: use_env ?
			process.env.WEB_SOCKETS_URI :
			websocketsConfig.url,

		inline: use_env ?
			!!process.env.WEB_SOCKETS_INLINE :
			websocketsConfig.inline,

		domain: websocketsConfig.domain,

		port: websocketsConfig.port,

		path: websocketsConfig.path,


		externalPort: websocketsConfig.externalPort
	},

	paths: require('../../config/paths'),

	authentication: require('../../config/authentication'),

	credentials: {
		facebook: {
			appSecret: use_env ?
				process.env.CREDENTIALS_FACEBOOK_SECRET :
				_.get(credentialsConfig, 'facebook.appSecret'),

			appID: use_env ?
				process.env.CREDENTIALS_FACEBOOK_APPID :
				_.get(credentialsConfig, 'facebook.appID')
		},

		mongodb: {
			username: use_env ?
				process.env.CREDENTIALS_MONGO_USERNAME :
				_.get(credentialsConfig, 'mongodb.username'),

			password: use_env ?
				process.env.CREDENTIALS_MONGO_PASSWORD :
				_.get(credentialsConfig, 'mongodb.password')
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
	if (use_env) {
		try {
			config.log4js = JSON.parse(process.env.LOG4JS_CONFIG_STRING);
		}
		catch(ex) {}
	}
	else {
		config.log4js = log4jsConfig;
	}
}

debug('Configuration: \n', config);

exports = module.exports = config;
