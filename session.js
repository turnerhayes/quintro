"use strict";

var session    = require('express-session');
var debug      = require('debug')('quintro:session');
var MongoStore = require('connect-mongo')(session);
var config     = require('./lib/utils/config-manager');

debug('Connecting to session store at ', config.app.session.store.url);
var sessionStore = new MongoStore({
	url: config.app.session.store.url
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
