"use strict";

var session    = require('express-session');
var debug      = require('debug')('quintro:session');
var MongoStore = require('connect-mongo')(session);
var MongoUtils = require('./lib/utils/mongo');
var config     = require('./lib/utils/config-manager');


var connectionString = config.app.session.store.url || MongoUtils.getConnectionString(config.app.session.store);

debug('Connecting to session store at ', connectionString);
var sessionStore = new MongoStore({
	url: connectionString
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
