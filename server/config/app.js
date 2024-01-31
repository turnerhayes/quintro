const path = require("node:path");

const ENVIRONMENT = process.env.NODE_ENV || "development";

const IS_DEVELOPMENT = ENVIRONMENT === "development";

const DEFAULT_PORT = 4000;

const HTTP_DEFAULT_PORT = 80;
const HTTPS_DEFAULT_PORT = 443;

const PORT = Number(process.env.PORT) || DEFAULT_PORT;

const HOST = process.env.APP_ADDRESS_HOST || "localhost";
const EXTERNAL_PORT = Number(process.env.APP_ADDRESS_EXTERNAL_PORT) || PORT;

const IS_SECURE = process.env.APP_ADDRESS_IS_SECURE ||
	(process.env.APP_SSL_KEY && process.env.APP_SSL_CERT);
	
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

const sslKeyPath = process.env.APP_SSL_KEY ?
	path.resolve(PROJECT_ROOT, process.env.APP_SSL_KEY) :
	undefined;
const sslCertPath = process.env.APP_SSL_CERT ?
	path.resolve(PROJECT_ROOT, process.env.APP_SSL_CERT) :
	undefined;

module.exports = {
    environment: ENVIRONMENT,
    isDevelopment: IS_DEVELOPMENT,
    address: {
        host: HOST,
        insecurePort: Number(process.env.APP_ADDRESS_INSECURE_PORT),
        port: PORT,
        externalPort: EXTERNAL_PORT,
        isSecure: IS_SECURE,
        origin: ORIGIN
    },
    ssl: {
        key: sslKeyPath,
        cert: sslCertPath,
    }
};
