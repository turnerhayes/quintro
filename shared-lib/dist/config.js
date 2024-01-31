"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websockets = exports.staticContent = exports.game = exports.providerAuth = exports.ColorList = exports.api = exports.facebookProviderInfo = exports.googleProviderInfo = exports.AuthProvider = void 0;
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["GOOGLE"] = "google";
    AuthProvider["FACEBOOK"] = "facebook";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
exports.googleProviderInfo = {
    id: AuthProvider.FACEBOOK,
    name: "Facebook",
    isEnabled: Boolean(process.env.NEXT_PUBLIC_CREDENTIALS_GOOGLE_ENABLED),
};
exports.facebookProviderInfo = {
    id: AuthProvider.GOOGLE,
    name: "Google",
    isEnabled: Boolean(process.env.NEXT_PUBLIC_CREDENTIALS_GOOGLE_ENABLED),
};
const PROVIDERS = [
    exports.googleProviderInfo,
    exports.facebookProviderInfo,
];
const enabledProviders = PROVIDERS.filter(({ isEnabled }) => isEnabled);
const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT;
const host = process.env.APP_ADDRESS_HOST || process.env.NEXT_PUBLIC_APP_ADDRESS_HOST;
const webSocketPort = process.env.WEB_SOCKETS_PORT ||
    process.env.NEXT_PUBLIC_WEB_SOCKETS_PORT;
const webSocketHost = process.env.WEB_SOCKETS_HOST ||
    process.env.NEXT_PUBLIC_WEB_SOCKETS_HOST;
const webSocketSecure = Boolean(process.env.WEB_SOCKETS_SECURE ||
    process.env.NEXT_PUBLIC_WEB_SOCKETS_SECURE);
const websocketsOrigin = `http${webSocketSecure ? "s" : ""}://${webSocketHost}:${webSocketPort}`;
const webSocketsInline = webSocketPort === port && webSocketHost === host;
const websocketsPath = webSocketsInline ?
    "/sockets" :
    undefined;
let staticContentURL = process.env.STATIC_CONTENT_URL;
const staticContentInline = !staticContentURL;
// istanbul ignore else
if (staticContentInline) {
    staticContentURL = "";
}
const apiHost = process.env.API_ADDRESS_HOST || process.env.NEXT_PUBLIC_API_ADDRESS_HOST
    || process.env.APP_ADDRESS_HOST || (typeof global !== "undefined" && typeof global.document !== "undefined" ?
    global.document.location.hostname :
    undefined);
const apiPort = Number(process.env.API_ADDRESS_PORT ||
    process.env.NEXT_PUBLIC_API_ADDRESS_PORT);
const isSecure = Boolean(process.env.APP_SSL_KEY);
const schema = isSecure ? "https" : "http";
exports.api = {
    host: apiHost,
    port: apiPort,
    root: `${schema}://${apiHost}:${apiPort}`,
};
// Normalize URL to not end with a slash
staticContentURL = staticContentURL.replace(/\/$/, "");
class ColorList extends Array {
    colorIDs = [];
    // Cache a mapping of color ID to index within the colors array so that
    // we can quickly look up the color definition in the `get` method below
    colorIndexMap = {};
    constructor(...items) {
        super(...items);
        this.updateColorIndexMap(items);
    }
    push(...items) {
        const res = super.push(...items);
        this.updateColorIndexMap(items);
        return res;
    }
    get(id) {
        return this[this.colorIndexMap[id]];
    }
    get ids() {
        return this.colorIDs;
    }
    updateColorIndexMap(items) {
        this.forEach((colorDefinition, index) => {
            this.colorIndexMap[colorDefinition.id] = index;
            this.colorIDs.push(colorDefinition.id);
        });
    }
}
exports.ColorList = ColorList;
const colors = new ColorList({
    id: "blue",
    name: "Blue",
    hex: "#0000FF",
}, {
    id: "red",
    name: "Red",
    hex: "#FF0000",
}, {
    id: "yellow",
    name: "Yellow",
    hex: "#FFFF00",
}, {
    id: "green",
    name: "Green",
    hex: "#008000",
}, {
    id: "purple",
    name: "Purple",
    hex: "#9706CC",
}, {
    id: "black",
    name: "Black",
    hex: "#000000",
});
exports.providerAuth = {
    allProviders: PROVIDERS,
    enabledProviders,
};
exports.game = {
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
exports.staticContent = {
    inline: staticContentInline,
    url: staticContentURL,
};
exports.websockets = {
    inline: webSocketsInline,
    origin: websocketsOrigin,
    url: websocketsOrigin,
    path: websocketsPath,
    secure: webSocketSecure,
    host: webSocketHost,
    port: webSocketPort,
};
