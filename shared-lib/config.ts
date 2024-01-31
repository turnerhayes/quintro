import { User } from "next-auth";

export interface PlayerColor {
	id: string;
	name: string;
	hex: string;
}

export enum AuthProvider {
    GOOGLE = "google",
    FACEBOOK = "facebook",
	ANONYMOUS = "anonymous",
}

export interface ProviderInfo {
    id: AuthProvider;
    name: string;
	isEnabled: boolean;
	secret?: string;
}

export interface QuintroUser extends User {
	id: string;
	username: string;
    provider?: AuthProvider;
    names?: {
        given: string;
        family?: string;
        display: string;
    };
}

export const ANONYMOUS_USERNAME = "<anonymous>";

export const facebookProviderInfo: ProviderInfo = {
	id: AuthProvider.FACEBOOK,
	name: "Facebook",
	isEnabled: Boolean(process.env.NEXT_PUBLIC_CREDENTIALS_FACEBOOK_ENABLED),
	secret: process.env.CREDENTIALS_FACEBOOK_APP_SECRET,
};

export const googleProviderInfo: ProviderInfo = {
	id: AuthProvider.GOOGLE,
	name: "Google",
	isEnabled: Boolean(process.env.NEXT_PUBLIC_CREDENTIALS_GOOGLE_ENABLED),
	secret: process.env.CREDENTIALS_GOOGLE_CLIENT_SECRET,
};

const PROVIDERS: ProviderInfo[] = [
    googleProviderInfo,
	facebookProviderInfo,
];

const enabledProviders = PROVIDERS.filter(
	({isEnabled}) => isEnabled
);

const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT;
const host = process.env.APP_ADDRESS_HOST || process.env.NEXT_PUBLIC_APP_ADDRESS_HOST;

const webSocketPort = process.env.WEB_SOCKETS_PORT ||
	process.env.NEXT_PUBLIC_WEB_SOCKETS_PORT;
const webSocketHost = process.env.WEB_SOCKETS_HOST ||
	process.env.NEXT_PUBLIC_WEB_SOCKETS_HOST;
const webSocketSecure = Boolean(
	process.env.WEB_SOCKETS_SECURE ||
	process.env.NEXT_PUBLIC_WEB_SOCKETS_SECURE
);
const websocketsOrigin = `http${webSocketSecure ? "s" : ""}://${webSocketHost}:${webSocketPort}`;
const webSocketsInline = webSocketPort === port && webSocketHost === host;

const websocketsPath = webSocketsInline ?
	"/sockets" :
	undefined;

let staticContentURL = process.env.STATIC_CONTENT_URL || "";
const staticContentInline = !staticContentURL;

// istanbul ignore else
if (staticContentInline) {
	staticContentURL = "";
}

const apiHost = process.env.API_ADDRESS_HOST || process.env.NEXT_PUBLIC_API_ADDRESS_HOST
	||  process.env.APP_ADDRESS_HOST || (
		typeof global !== "undefined" && typeof global.document !== "undefined" ?
			global.document.location.hostname :
			undefined
	);

const apiPort = Number(process.env.API_ADDRESS_PORT || 
	process.env.NEXT_PUBLIC_API_ADDRESS_PORT);
const isSecure = Boolean(process.env.APP_SSL_KEY);

const schema = isSecure ? "https" : "http";

export const api = {
	host: apiHost,
	port: apiPort,
	root: `${schema}://${apiHost}:${apiPort}`,
};

// Normalize URL to not end with a slash
staticContentURL = staticContentURL.replace(/\/$/, "");

export class ColorList extends Array<PlayerColor> {
	colorIDs: string[] = [];

	// Cache a mapping of color ID to index within the colors array so that
	// we can quickly look up the color definition in the `get` method below
	colorIndexMap: {[id: string]: number} = {};

	constructor(...items: PlayerColor[]) {
		super(...items);
		this.updateColorIndexMap(items);
	}

	push(...items: PlayerColor[]) {
		const res = super.push(...items);
		this.updateColorIndexMap(items);
		return res;
	}

	get(id: string) {
		return this[this.colorIndexMap[id]];
	}

	get ids() {
		return this.colorIDs;
	}

	private updateColorIndexMap(items: PlayerColor[]) {
		this.forEach(
			(colorDefinition: PlayerColor, index: number) => {
				this.colorIndexMap[colorDefinition.id] = index;

				this.colorIDs.push(colorDefinition.id);
			}
		);
	}
}

const colors = new ColorList(
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
);

export const providerAuth = {
	allProviders: PROVIDERS,
	enabledProviders,
};

export const game = {
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
	colors,
};

export const staticContent = {
	inline: staticContentInline,
	url: staticContentURL,
};

export const websockets = {
	inline: webSocketsInline,
	origin: websocketsOrigin,
	url: websocketsOrigin,
	path: websocketsPath,
	secure: webSocketSecure,
	host: webSocketHost,
	port: webSocketPort,
};
