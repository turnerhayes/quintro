"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionClient = void 0;
const google_1 = __importDefault(require("next-auth/providers/google"));
const facebook_1 = __importDefault(require("next-auth/providers/facebook"));
const mongodb_1 = require("mongodb");
const session_config_1 = __importDefault(require("./session-config"));
const config_1 = require("./config");
let client;
let clientPromise;
const getSessionClient = async () => {
    if (clientPromise) {
        return clientPromise;
    }
    const options = {};
    if (process.env.NODE_ENV === "development") {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        if (!global._mongoClientPromise) {
            client = new mongodb_1.MongoClient(session_config_1.default.db.url, options);
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    }
    else {
        // In production mode, it's best to not use a global variable.
        client = new mongodb_1.MongoClient(session_config_1.default.db.url, options);
        clientPromise = client.connect();
    }
    return clientPromise;
};
exports.getSessionClient = getSessionClient;
const nextAuthConfig = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        ...(config_1.providerAuth.enabledProviders.includes(config_1.googleProviderInfo) ?
            [
                (0, google_1.default)({
                    clientId: process.env.CREDENTIALS_GOOGLE_CLIENT_ID,
                    clientSecret: process.env.CREDENTIALS_GOOGLE_CLIENT_SECRET,
                    profile(profile) {
                        console.log("Profile:", profile);
                        const user = {
                            id: profile.sub,
                            provider: config_1.AuthProvider.GOOGLE,
                            names: {
                                given: profile.given_name,
                                display: profile.name,
                                username: profile.email,
                            },
                        };
                        return user;
                    },
                })
            ] :
            []),
        ...(config_1.providerAuth.enabledProviders.includes(config_1.facebookProviderInfo) ?
            [
                (0, facebook_1.default)({
                    clientId: process.env.CREDENTIALS_FACEBOOK_APP_ID,
                    clientSecret: process.env.CREDENTIALS_FACEBOOK_APP_SECRET,
                })
            ] :
            []),
    ],
};
module.exports = nextAuthConfig;
