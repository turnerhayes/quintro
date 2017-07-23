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

let staticContentURL = process.env.STATIC_CONTENT_URL;
const staticContentInline = !staticContentURL;

if (staticContentInline) {
	staticContentURL = global.document.origin;
}
else {
	staticContentURL = staticContentURL.replace(/\/$/, "");
}

exports = module.exports = {
	app: {
		environment: ENVIRONMENT,
		isDevelopment: IS_DEVELOPMENT
	},

	game: {
		board: {
			width: {
				min: 15,
				max: 25
			},
			height: {
				min: 15,
				max: 25
			}
		},
		players: {
			min: 3,
			max: 6
		}
	},

	staticContent: {
		inline: staticContentInline,
		url: staticContentURL
	},

	websockets: {
		inline: webSocketsInline,
		url: websocketsUrl,
		path: websocketsPath
	}
};
