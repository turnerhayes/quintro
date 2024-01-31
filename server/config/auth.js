
const credentialEnvsByProvider = {};

Object.keys(process.env).forEach(
	(key) => {
		const matches = /CREDENTIALS_([A-Z]+)_*/.exec(key);

		if (!matches) {
			return;
		}

		const provider = matches[1];

		if (provider === "DB") {
			return;
		}

		credentialEnvsByProvider[provider] = credentialEnvsByProvider[provider] || [];
		credentialEnvsByProvider[provider].push(key);
	}
);

const enabledAuths = Object.keys(credentialEnvsByProvider).reduce(
	(enabledHash, provider) => {
		enabledHash[provider.toLowerCase()] = credentialEnvsByProvider[provider].reduce(
			(wasValid, credentialKey) => wasValid && !!process.env[credentialKey],
			true
		);

		return enabledHash;
	},
	{}
);

module.exports = {
    facebook: {
        appId: process.env.CREDENTIALS_FACEBOOK_APP_ID,
        appSecret: process.env.CREDENTIALS_FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        isEnabled: enabledAuths.facebook,
        scope: [
            "public_profile",
            "email",
            "user_friends"
        ]
    },
    google: {
        clientID: process.env.CREDENTIALS_GOOGLE_CLIENT_ID,
        clientSecret: process.env.CREDENTIALS_GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        isEnabled: enabledAuths.google,
        scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
    },
};
