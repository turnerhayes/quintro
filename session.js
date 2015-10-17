"use strict";

var session    = require('express-session');
var MongoStore = require('connect-mongo')(session);
var MongoUtils = require('./lib/utils/mongo');
var config     = require('./lib/utils/config-manager');

var sessionStore = new MongoStore({
	url: config.app.session.store.url || MongoUtils.getConnectionString(config.app.session.store)
});

var sessionInstance = session({
	key: config.app.session.key,
	store: sessionStore,
	secret: config.app.secret,
	cookie: {
		domain: '.' + config.app.address.host
	},
	saveUninitialized: true,
	resave: false
});

exports = module.exports = {
	store: sessionStore,
	instance: sessionInstance,
};
