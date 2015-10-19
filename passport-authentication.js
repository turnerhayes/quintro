"use strict";

var _                    = require('lodash');
var passport             = require('passport');
var FacebookStrategy     = require('passport-facebook').Strategy;
var LocalStrategy        = require('passport-local').Strategy;
var UserStore            = require('./lib/persistence/stores/user');
var UserModel            = require('./lib/persistence/models/user');
var config               = require('./lib/utils/config-manager');

var callbackURL = "http" + (config.app.address.isSecure ? "s" : "") + "://" + config.app.address.host;
var port = config.app.address.externalPort && Number(config.app.address.externalPort);

// If the port is 80, don't bother adding it
if (port && port !== 80) {
	callbackURL += ":" + port;
}

callbackURL += config.authentication.facebook.callbackURL;

passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	UserStore.getUserByID(id).done(function(user) {
		done(null, user);
	});
});

passport.use(
	new FacebookStrategy(
		{
			clientID         : config.credentials.facebook.appID,
			clientSecret     : config.credentials.facebook.appSecret,
			callbackURL      : callbackURL,
			profileFields    : config.authentication.facebook.profileFields,
			passReqToCallback: true
		},
		function(req, accessToken, refreshToken, profile, done) {
			if (!profile) {
				done(Error('Got no profile'));
				return;
			}

			UserStore.getUser({
				filters: {
					facebookId: profile.id
				}
			}).then(
				function(user) {
					if (user) {
						return user;
					}

					var email;

					if (profile.emails && profile.emails.length > 0) {
						email = profile.emails[0].value;
					}

					var username = profile.username || email;

					return UserStore.addUser(
						new UserModel({
							username: username,
							facebookId: parseInt(profile.id, 10),
							preferredDisplayName: profile.displayName,
							profilePhotoURL: "https://graph.facebook.com/" + profile.id +"/picture?type=square",
							name: {
								first: profile.name.givenName,
								last: profile.name.familyName,
								middle: profile.name.middleName,
							},
							email: email,
						})
					);
				}
			).done(
				function(user) {
					done(null, user);
				},
				function(err) {
					done(err);
				}
			);
		}
	)
);

passport.use(new LocalStrategy(
	function(username, password, done) {
		UserStore.getUser({
			filters: {
				username: username
			}
		}).then(
			function(user) {
				if (!user) {
					done(null, false);
				}

				// check password
				var passwordVerified = true;

				if (passwordVerified) {
					return done(null, user);
				}

				return done(null, false);
			},
			function(err) {
				done(err);
			}
		);
  }
));

module.exports = function(app) {
	app.use(passport.initialize());
	app.use(passport.session());
};
