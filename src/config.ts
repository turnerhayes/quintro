let apiPortString: string;

if ("process" in globalThis) {
	apiPortString = process.env.VITE_API_PORT || "";
}
else {
	apiPortString = import.meta.env.VITE_API_PORT || "";
}

if (!apiPortString) {
	throw new Error(`API port missing; set VITE_API_PORT environment variable`);
}

const apiPort = Number(apiPortString);

if (Number.isNaN(apiPort)) {
	throw new Error(`API port ${
		apiPortString
	} is not a valid number; must be an integer. Check your VITE_API_PORT environment variable.`);
}

let apiHost: string;

if ("process" in globalThis) {
	apiHost = process.env.VITE_API_HOST || "";
}
else {
	apiHost = import.meta.env.VITE_API_HOST || "";
}

if (!apiHost) {
	if ("location" in globalThis) {
		apiHost = location.hostname;
	}
}

let clientOrigin: string = "";

if ("process" in globalThis) {
	clientOrigin = process.env.CLIENT_ORIGIN || "";
}

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

let isFacebookEnabled: boolean;
let isGoogleEnabled: boolean;

if ("process" in globalThis) {
	isFacebookEnabled = Boolean(process.env.VITE_CREDENTIALS_FACEBOOK_ENABLED);
	isGoogleEnabled = Boolean(process.env.VITE_GOOGLE_CREDENTIALS_ENABLED);
}
else {
	isFacebookEnabled = Boolean(import.meta.env.VITE_CREDENTIALS_FACEBOOK_ENABLED);
	isGoogleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CREDENTIALS_ENABLED);
}

const auth = {
	facebook: {
		isEnabled: isFacebookEnabled,
	},
	google: {
		isEnabled: isGoogleEnabled,
	},
} as const;

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

	api: {
		host: apiHost,
		port: apiPort,
	},

	client: {
		origin: clientOrigin,
	},

	auth,
} as const;
