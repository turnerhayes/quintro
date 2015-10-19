"use strict";

var fs         = require('fs');
var _          = require('lodash');
var MongoUtils = require('./mongo');

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
			console.log('using environment config');
			return;
		}

		var appConfig         = require('../../config/app');
		var log4jsConfig      = require('../../config/log4js');
		var mongoConfig       = require('../../config/mongo');
		var websocketsConfig  = require('../../config/websockets');
		var credentialsConfig = require('../../config/credentials');

		process.env.CREDENTIALS_MONGO_USERNAME = _.get(credentialsConfig, 'mongodb.username') || '';

		process.env.CREDENTIALS_MONGO_PASSWORD = _.get(credentialsConfig, 'mongodb.password') || '';

		process.env.ENVIRONMENT = appConfig.environment;

		process.env.APP_SECRET = appConfig.secret;

		process.env.LOGGING_FORMAT = _.get(appConfig, 'logging.format') || '';

		process.env.LOGGING_USE_CONSOLE = _.get(appConfig, 'logging.useConsole') ? 1 : 0;

		process.env.SESSION_KEY = _.get(appConfig, 'session.key') || '';

		process.env.SESSION_STORE_URI = _.get(appConfig, 'session.store.url') ||
			MongoUtils.getConnectionString(
				_.get(appConfig, 'session.store'),
				{
					username: process.env.CREDENTIALS_MONGO_USERNAME,
					password: process.env.CREDENTIALS_MONGO_PASSWORD
				}
			);

		process.env.APP_ADDRESS_IS_SECURE = _.get(appConfig, 'address.isSecure') ? 1 : 0;

		process.env.APP_ADDRESS_HOST = _.get(appConfig, 'address.host') || '';

		process.env.APP_ADDRESS_PORT = _.get(appConfig, 'address.port') || '';

		process.env.APP_ADDRESS_EXTERNAL_PORT = _.get(appConfig, 'address.externalPort') || '';

		process.env.DATA_DB_URI = mongoConfig.url ||
			MongoUtils.getConnectionString(
				mongoConfig,
				{
					username: process.env.CREDENTIALS_MONGO_USERNAME,
					password: process.env.CREDENTIALS_MONGO_PASSWORD
				}
			);

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
