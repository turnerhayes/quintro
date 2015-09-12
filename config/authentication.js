"use strict";

var credentialsConfig = require('./credentials');

exports = module.exports = {
	"facebook": {
		"appID": credentialsConfig.facebook.appID,
		"appSecret": credentialsConfig.facebook.appSecret,
		"profileFields": [
			"id",
			"name",
			"displayName",
			"emails"
		],
		"scope": [
			"email"
		],
		"callbackURL": "/auth/fb/callback"
	}
};
