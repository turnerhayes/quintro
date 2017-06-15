"use strict";

const path         = require("path");

const DEFAULT_PORT = 4000;

const HTTP_DEFAULT_PORT = 80;
const HTTPS_DEFAULT_PORT = 443;

const PORT = Number(process.env.PORT) || DEFAULT_PORT;

const HOST = process.env.APP_ADDRESS_HOST;
const EXTERNAL_PORT = Number(process.env.APP_ADDRESS_EXTERNAL_PORT) || PORT;

const IS_SECURE = process.env.APP_ADDRESS_IS_SECURE ||
	process.env.APP_SSL_KEY && process.env.APP_SSL_CERT;
	
const ORIGIN = (function() {
	let baseURL = "http" + (IS_SECURE ? "s" : "") + "://" +
		HOST;

	if (
		!(EXTERNAL_PORT === HTTP_DEFAULT_PORT && !IS_SECURE) &&
		!(EXTERNAL_PORT === HTTPS_DEFAULT_PORT && IS_SECURE)
	) {
		baseURL += ":" + EXTERNAL_PORT;
	}

	return baseURL;
}());

// "fake" document object so that shared-config can access it when not run from the
// client (as it's doing here)
global.document = {
	origin: ORIGIN
};

const rfr          = require("rfr");
const sharedConfig = rfr("shared-lib/config");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const CLIENT_PATH = path.join(PROJECT_ROOT, "client");
const DIST_PATH = path.join(PROJECT_ROOT, "dist");
const LOGS_DIRECTORY = path.resolve(PROJECT_ROOT, process.env.LOGS_DIRECTORY || "logs");

const DB_URL = process.env.CREDENTIALS_DB_URL;

const SESSION_DB_URL = process.env.SESSION_DB_URL;

let staticContentURL = process.env.STATIC_CONTENT_URL;
const staticContentInline = !staticContentURL;

if (staticContentInline) {
	staticContentURL = `${ORIGIN}/static`;
}

const Config = {
	app: {
		environment: sharedConfig.app.environment,
		isDevelopment: sharedConfig.app.isDevelopment,
		address: {
			host: HOST,
			insecurePort: Number(process.env.APP_ADDRESS_INSECURE_PORT),
			port: PORT,
			externalPort: EXTERNAL_PORT,
			isSecure: IS_SECURE,
			origin: ORIGIN
		},
		ssl: {
			key: process.env.APP_SSL_KEY,
			cert: process.env.APP_SSL_CERT
		}
	},
	paths: {
		root: PROJECT_ROOT,
		client: CLIENT_PATH,
		dist: DIST_PATH,
		logs: LOGS_DIRECTORY
	},
	auth: {
		facebook: {
			appId: process.env.CREDENTIALS_FACEBOOK_APP_ID,
			appSecret: process.env.CREDENTIALS_FACEBOOK_APP_SECRET,
			callbackURL: "/auth/fb/callback",
			scope: [
				"public_profile",
				"email",
				"user_friends"
			]
		}
	},
	websockets: sharedConfig.websockets,
	staticContent: {
		inline: staticContentInline,
		url: staticContentURL.replace(/\/$/, "")
	},
	storage: {
		db: {
			url: DB_URL
		}
	},
	session: {
		secret: process.env.SESSION_SECRET,
		cookieName: process.env.SESSION_COOKIE_NAME || "quintro.sid",
		db: {
			url: SESSION_DB_URL
		}
	},
	shared: sharedConfig,
	logging: {
		error: {
			file: process.env.LOGGING_ERROR_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.LOGGING_ERROR_FILE) :
				null
		},
		access: {
			file: process.env.LOGGING_ACCESS_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.LOGGING_ACCESS_FILE) :
				null
		},
		sql: {
			file: process.env.LOGGING_SQL_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.LOGGING_SQL_FILE) :
				(
					sharedConfig.app.isDevelopment ?
						null :
						false
				)
		},
		websockets: {
			file: process.env.WEB_SOCKETS_LOGGING_FILE ?
				path.resolve(LOGS_DIRECTORY, process.env.WEB_SOCKETS_LOGGING_FILE) :
				null
		}
	}
};

exports = module.exports = Config;
