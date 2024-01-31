import { useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { QuintroUser , ProviderInfo } from "@shared/config";
import AccountDialog from "@app/components/AccountDialog";
import Config from "@app/config";



const AccountDialogContainer = () => {
	const {
		data: session,
        status,
	} = useSession();
    const user = status === "authenticated" &&
            (session as unknown as {[key: string]: string}).token_provider !== "anonymous" ?
        (session.user as QuintroUser) :
        undefined;

    const handleLogin = useCallback(({
        provider,
    }: {
        provider: ProviderInfo;
    }) => {
        signIn(provider.id);
    }, []);

    const handleLogout = useCallback(() => {
        signOut();
    }, []);

    return (
        <AccountDialog
            loggedInUser={user}
            enabledProviders={Config.providerAuth.enabledProviders}
            onLogin={handleLogin}
            onLogout={handleLogout}
        />
    );
};

export default AccountDialogContainer;
