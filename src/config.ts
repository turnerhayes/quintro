// const webSocketsInline = !process.env.WEB_SOCKETS_URL;

// const websocketsPath = webSocketsInline ?
// 	"/sockets" :
// 	undefined;

let websocketsPortString: string|undefined;

if ("process" in globalThis) {
	websocketsPortString = process.env.VITE_WEBSOCKETS_PORT
}
else {
	websocketsPortString = import.meta.env.VITE_WEBSOCKETS_PORT;
}

if (!websocketsPortString) {
	throw new Error(`"${websocketsPortString}" is not set. Set a valid port number in the environment variable WEBSOCKETS_PORT.`)
}

const websocketsPort = Number(websocketsPortString);

if (isNaN(websocketsPort)) {
    throw new Error(`"${websocketsPortString}" is not a valid port number. Set a valid port number in the environment variable WEBSOCKETS_PORT.`)
}

// const websocketsUrl = webSocketsInline ?
// 	"/" :
// 	process.env.WEB_SOCKETS_URL;

// let staticContentURL = process.env.STATIC_CONTENT_URL || "";
// const staticContentInline = !staticContentURL;

// istanbul ignore else
// if (staticContentInline) {
// 	staticContentURL = "";
// }

// Normalize URL to not end with a slash
// staticContentURL = staticContentURL.replace(/\/$/, "");


const colors = [
	{
		id: "blue",
		name: "Blue",
		hex: "#0000FF",
	},
	{
		id: "red",
		name: "Red",
		hex: "#FF0000",
	},
	{
		id: "yellow",
		name: "Yellow",
		hex: "#FFFF00",
	},
	{
		id: "green",
		name: "Green",
		hex: "#008000",
	},
	{
		id: "purple",
		name: "Purple",
		hex: "#9706CC",
	},
	{
		id: "black",
		name: "Black",
		hex: "#000000",
	},
];

export type ColorID = typeof colors[number]["id"];

export interface ColorDefinition {
    id: ColorID;
    name: string;
    hex: string;
}

export type ColorList = ColorDefinition[] & {
    get: (colorID: ColorID) => ColorDefinition;
    ids: string[];
};

// Cache a mapping of color ID to index within the colors array so that
// we can quickly look up the color definition in the `get` method below
const colorIndexMap: Record<string, number> = {};

const colorIDs: ColorID[] = [];

colors.forEach(
	(colorDefinition, index) => {
		colorIndexMap[colorDefinition.id] = index;

		colorIDs.push(colorDefinition.id);
	}
);

Object.defineProperties(
	colors,
	{
		// Utility method to fetch a color definition from a color ID
		get: {
			value: function getColorDefinition(colorID: string) {
				return colors[colorIndexMap[colorID]];
			},
		},

		ids: {
			value: colorIDs,
		},
	}
);

interface AuthConfig {
	isEnabled: boolean;
}

const auth = {
	facebook: {
	} as AuthConfig,
	google: {
	} as AuthConfig,
};

if ("process" in globalThis) {
	auth.facebook.isEnabled = Boolean(process.env.VITE_CREDENTIALS_FACEBOOK_ENABLED);
	auth.google.isEnabled = Boolean(process.env.VITE_GOOGLE_CREDENTIALS_ENABLED);
}
else {
	auth.facebook.isEnabled = Boolean(import.meta.env.VITE_CREDENTIALS_FACEBOOK_ENABLED);
	auth.google.isEnabled = Boolean(import.meta.env.VITE_GOOGLE_CREDENTIALS_ENABLED);
}

export type AuthProviderID = keyof typeof auth;

export default {
	game: {
		board: {
			width: {
				min: 10,
				max: 25,
			},
			height: {
				min: 10,
				max: 25,
			}
		},
		players: {
			min: 3,
			max: 8,
		},
		colors: colors as ColorList,
	},

	auth,

	staticContent: {
		// inline: staticContentInline,
		// url: staticContentURL,
	},

	websockets: {
		// inline: webSocketsInline,
		// url: websocketsUrl,
		// path: websocketsPath,
		port: websocketsPort,
	},
};
