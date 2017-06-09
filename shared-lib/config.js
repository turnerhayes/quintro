"use strict";

const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_DEVELOPMENT = ENVIRONMENT === "development";

const WEB_SOCKETS_RUN_INLINE = !!process.env.WEB_SOCKETS_RUN_INLINE;

const websocketsPath = WEB_SOCKETS_RUN_INLINE ?
	"/sockets" :
	undefined;

const websocketsUrl = WEB_SOCKETS_RUN_INLINE ?
	global.document.origin :
	process.env.WEB_SOCKETS_URL;

exports = module.exports = {
	app: {
		environment: ENVIRONMENT,
		isDevelopment: IS_DEVELOPMENT,	
	},

	websockets: {
		inline: WEB_SOCKETS_RUN_INLINE,
		url: websocketsUrl,
		path: websocketsPath
	}
};
