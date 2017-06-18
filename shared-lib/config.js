"use strict";

const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_DEVELOPMENT = ENVIRONMENT === "development";

const webSocketsInline = !process.env.WEB_SOCKETS_URL;

const websocketsPath = webSocketsInline ?
	"/sockets" :
	undefined;

const websocketsUrl = webSocketsInline ?
	global.document.origin :
	process.env.WEB_SOCKETS_URL;

exports = module.exports = {
	app: {
		environment: ENVIRONMENT,
		isDevelopment: IS_DEVELOPMENT,	
	},

	websockets: {
		inline: webSocketsInline,
		url: websocketsUrl,
		path: websocketsPath
	}
};
