"use strict";

const passport         = require("passport");
const FacebookStrategy = require("passport-facebook");
const rfr              = require("rfr");
const UserStore        = rfr("server/persistence/stores/user");
const Config           = rfr("server/lib/config");

const callbackURL = Config.app.address.origin + Config.auth.facebook.callbackURL;

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	UserStore.findByID(id).then(function(user) {
		done(null, user);
	}).catch(err => {
		done(err);
	});
});

passport.use(new FacebookStrategy(
	{
		clientID: Config.auth.facebook.appId,
		clientSecret: Config.auth.facebook.appSecret,
		callbackURL: callbackURL,
		passReqToCallback: true,
		profileFields: ["id", "email", "name", "displayName"],
		enableProof: true
	},
	(req, accessToken, refreshToken, profile, done) => {
		UserStore.findByProviderID("facebook", profile.id).then(
			user => {
				if (user) {
					done(null, user);
				}
				else {
					let email;

					if (profile.emails.length > 0) {
						email = profile.emails[0].value;
					}

					UserStore.createUser({
						username: profile.username || email || profile.id,
						email: email,
						provider: "facebook",
						providerID: profile.id,
						name: {
							first: profile.name.givenName,
							middle: profile.name.middleName,
							last: profile.name.familyName,
							display: profile.displayName
						}
					}).then(user => done(null, user));
				}
			}
		).catch(
			ex => done(ex)
		);
	}
));

module.exports = exports = function(app) {
	app.use(passport.initialize());
	app.use(passport.session());
};
