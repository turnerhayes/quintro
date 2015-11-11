"use strict";

var fs         = require('fs');
var _          = require('lodash');

exports = module.exports = {
	logFatalException: function(ex, path, cb) {
		fs.appendFile(
			path,
			"\n" + JSON.stringify(
				{
					time: new Date().toString(),
					message: ex.message,
					stack: ex.stack
				},
				null,
				'\t'
			),
			{
				encoding: 'utf8'
			},
			cb
		);
	},

	configFilesToEnvironment: function() {
		if (!!process.env.USE_ENVIRONMENT_CONFIG) {
			return;
		}

		var appConfig         = require('../../config/app');
		var log4jsConfig      = require('../../config/log4js');
		var mongoConfig       = require('../../config/mongo');
		var websocketsConfig  = require('../../config/websockets');
		var credentialsConfig = require('../../config/credentials');

		process.env.ENVIRONMENT = process.env.ENVIRONMENT || appConfig.environment ||
			process.env.NODE_ENV || "development";

		process.env.APP_SECRET = appConfig.secret;

		process.env.LOGGING_FORMAT = _.get(appConfig, 'logging.format') || '';

		process.env.LOGGING_USE_CONSOLE = _.get(appConfig, 'logging.useConsole') ? 1 : '';

		process.env.SESSION_KEY = _.get(appConfig, 'session.key') || '';

		process.env.SESSION_STORE_URI = _.get(appConfig, 'session.store.url');

		process.env.APP_ADDRESS_IS_SECURE = _.get(appConfig, 'address.isSecure') ? 1 : '';

		process.env.APP_ADDRESS_HOST = _.get(appConfig, 'address.host') || '';

		process.env.APP_ADDRESS_PORT = _.get(appConfig, 'address.port') || '';

		process.env.APP_ADDRESS_EXTERNAL_PORT = _.get(appConfig, 'address.externalPort') || '';

		process.env.DATA_DB_URI = mongoConfig.url;

		process.env.WEB_SOCKETS_URI = websocketsConfig.url ||
			"http" + (websocketsConfig.isSecure ? "s" : "") + "://" + websocketsConfig.domain +
				(
					websocketsConfig.externalPort && Number(websocketsConfig.externalPort) !== 80 ?
						":" + websocketsConfig.externalPort :
						""
				) + (
					websocketsConfig.path ?
						"/" + websocketsConfig.path :
						""
				);

		process.env.WEB_SOCKETS_INLINE = websocketsConfig.inline ? 1 : 0;

		process.env.CREDENTIALS_FACEBOOK_SECRET = _.get(credentialsConfig, 'facebook.appSecret') || '';

		process.env.CREDENTIALS_FACEBOOK_APPID = _.get(credentialsConfig, 'facebook.appID') || '';

		process.env.LOG4JS_CONFIG_STRING = log4jsConfig ? JSON.stringify(log4jsConfig) : '';
	}
};
