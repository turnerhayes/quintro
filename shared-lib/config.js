"use strict";

const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_DEVELOPMENT = ENVIRONMENT === "development";

const WEB_SOCKETS_RUN_INLINE = !!process.env.WEB_SOCKETS_RUN_INLINE;

const WEB_SOCKETS_PORT = Number(process.env.WEB_SOCKETS_PORT);

const WEB_SOCKETS_URL = WEB_SOCKETS_RUN_INLINE ?
	global.document.origin.replace(/\:\d+$/, ":" + WEB_SOCKETS_PORT) : process.env.WEB_SOCKETS_URL;

exports = module.exports = {
	app: {
		environment: ENVIRONMENT,
		isDevelopment: IS_DEVELOPMENT,	
	},

	websockets: {
		inline: WEB_SOCKETS_RUN_INLINE,
		port: WEB_SOCKETS_RUN_INLINE ? WEB_SOCKETS_PORT : undefined,
		url: WEB_SOCKETS_URL
	}
};
