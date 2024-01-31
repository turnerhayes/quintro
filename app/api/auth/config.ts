import { Account, NextAuthOptions, Profile, Session, SessionStrategy } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { Provider } from "next-auth/providers";
import { JWT } from "next-auth/jwt";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import  {randomUUID} from "node:crypto";
import { MongoClient } from "mongodb";
import SessionConfig from "@server/config/session";
import {
    ANONYMOUS_USERNAME,
    AuthProvider,
    QuintroUser,
    facebookProviderInfo,
    googleProviderInfo,
    providerAuth
} from "@shared/config";
import { AdapterUser } from "next-auth/adapters";


let client: MongoClient;
let clientPromise: Promise<MongoClient>;

export const getSessionClient = async (): Promise<MongoClient> => {
    if (clientPromise) {
        return clientPromise;
    }

    const options = {};
    if (process.env.NODE_ENV === "development") {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        if (!global._mongoClientPromise) {
            client = new MongoClient(SessionConfig.db.url!, options);
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        // In production mode, it's best to not use a global variable.
        client = new MongoClient(SessionConfig.db.url!, options);
        clientPromise = client.connect();
    }

    return clientPromise;
};


// Anonymous user flow largely taken from
// https://www.lightenna.com/tech/2023/use-nextauth-with-nextjs-app-router-for-anonymous-logins/
const createAnonymousUser = (): QuintroUser => {
    return {
        id: `anonymous_${randomUUID()}`,
        username: ANONYMOUS_USERNAME,
        provider: AuthProvider.ANONYMOUS,
    };
};

const anonymousProvider = CredentialsProvider({
    name: "anonymous",
    credentials: {},
    async authorize(credentials, req) {
        const user = createAnonymousUser();
        return user;
    },
});

const providers: Provider[] = [
    anonymousProvider,
];

if (providerAuth.enabledProviders.includes(googleProviderInfo)) {
	providers.push(GoogleProvider({
		clientId: googleProviderInfo.id,
		clientSecret: googleProviderInfo.secret!,
		profile(profile): QuintroUser {
			console.log("Profile:", profile);
			const user = {
				id: profile.sub,
				provider: AuthProvider.GOOGLE,
                email: profile.email,
                username: profile.email,
				names: {
					given: profile.given_name,
					display: profile.name,
					username: profile.email,
				},
			};
			return user;
		},
	}));
}

if (providerAuth.enabledProviders.includes(facebookProviderInfo)) {
	providers.push(FacebookProvider({
		clientId: facebookProviderInfo.id,
		clientSecret: facebookProviderInfo.secret!,
	}));
}

const config = {
    secret: process.env.NEXTAUTH_SECRET,
    providers,
    adapter: MongoDBAdapter(getSessionClient()),
    callbacks: {
        async jwt({
            token,
            account,
            profile,
        }: {
            token: JWT;
            account: Account | null;
            profile?: Profile;
        }): Promise<JWT> {
            // console.log("JWT callback:", {token, account, profile});
            if (account?.expires_at && account?.type === "oauth") {
                token.access_token = account.access_token;
                token.expires_at = account.expires_at;
                token.refresh_token = account.refresh_token;
                token.refresh_token_expires_in = account.refresh_token_expires_in;
                token.provider = account.provider;
            }
            if (!token.provider && !account?.provider) {
                token.provider = "anonymous";
            }

            return token;
        },
        async session({
            session,
            token,
            user,
        }: {
            session: Session;
            token: JWT;
            user: AdapterUser;
        }): Promise<Session> {
            // console.log("Session callback:", {session, token, user});
            // don't make the token (JWT) contents available to the client session (JWT), but flag that they're server-side
            if (token.provider) {
                (session as unknown as {[key: string]: string})["token_provider"] = token.provider as string;
            }
            return session;
        },
    },
    events: {
        async signIn({
            user,
            account,
            profile,
        }: {
            user: QuintroUser;
            account: Account | null;
            profile?: Profile;
        }): Promise<void> {
            // console.log(`signIn of ${user.names} from ${user?.provider || account?.provider}`);
        },
        async signOut({
            session,
            token,
        }: {
            session: Session;
            token: JWT;
        }): Promise<void> {
            // console.log(`signOut of ${token.name} from ${token.provider}`);
        },
    },
    session: {
        // use default, an encrypted JWT (JWE) store in the session cookie
        strategy: "jwt",
    },
} satisfies NextAuthOptions;

export default config;
