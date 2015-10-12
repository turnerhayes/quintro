"use strict";

var session    = require('express-session');
var MongoStore = require('connect-mongo')(session);
var MongoUtils = require('./lib/mongo-utils');
var appConfig  = require('./config/app');

var sessionStore = new MongoStore({
	url: MongoUtils.getConnectionString(appConfig.session.store)
});

var sessionInstance = session({
	key: appConfig.session.key,
	store: sessionStore,
	secret: appConfig.secret,
	cookie: {
		domain: '.' + appConfig.address.host
	},
	saveUninitialized: true,
	resave: false
});

exports = module.exports = {
	store: sessionStore,
	instance: sessionInstance,
};
