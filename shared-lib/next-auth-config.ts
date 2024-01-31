import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { MongoClient } from "mongodb";
import SessionConfig from "./session-config";
import {
    AuthProvider,
    facebookProviderInfo,
    googleProviderInfo,
    providerAuth
} from "./config";


let client;
let clientPromise;

export const getSessionClient = async () => {
    if (clientPromise) {
        return clientPromise;
    }

    const options = {};
    if (process.env.NODE_ENV === "development") {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        if (!global._mongoClientPromise) {
            client = new MongoClient(SessionConfig.db.url, options);
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        // In production mode, it's best to not use a global variable.
        client = new MongoClient(SessionConfig.db.url, options);
        clientPromise = client.connect();
    }

    return clientPromise;
};


const nextAuthConfig = {
    secret: process.env.NEXTAUTH_SECRET,
	providers: [
		...(
			providerAuth.enabledProviders.includes(googleProviderInfo) ?
				[
				
					GoogleProvider({
						clientId: process.env.CREDENTIALS_GOOGLE_CLIENT_ID,
						clientSecret: process.env.CREDENTIALS_GOOGLE_CLIENT_SECRET,
						profile(profile) {
							console.log("Profile:", profile);
							const user = {
								id: profile.sub,
								provider: AuthProvider.GOOGLE,
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
				[]
		 ),
		...(
			providerAuth.enabledProviders.includes(facebookProviderInfo) ?
				[
					FacebookProvider({
						clientId: process.env.CREDENTIALS_FACEBOOK_APP_ID,
						clientSecret: process.env.CREDENTIALS_FACEBOOK_APP_SECRET,
					})
				] :
				[]
		),
	],
};

module.exports = nextAuthConfig;