import { useCallback }    from "react";
import {
	FormattedMessage,
	useIntl
}                         from "react-intl";
import { Link }           from "react-router";
import Button             from "@mui/material/Button";
import Icon               from "@mui/material/Icon";
import IconButton         from "@mui/material/IconButton";
import Card               from "@mui/material/Card";
import CardContent        from "@mui/material/CardContent";
import CardHeader         from "@mui/material/CardHeader";
import CardActions        from "@mui/material/CardActions";
import Config, {
	type AuthProviderID
}                         from "@/config";
import type { User }      from "@/types";

import styles             from "./AccountDialog.module.css";


const PROVIDER_INFO: Record<AuthProviderID, {
	id: AuthProviderID;
	name: string;
	ligature: string;
}> = {
	facebook: {
		id: "facebook",
		name: "Facebook",
		ligature: "facebook",
	},
	google: {
		id: "google",
		name: "Google+",
		ligature: "google plus"
	},
};

const defaultEnabledProviders = Object.keys(PROVIDER_INFO).filter(
	(provider) => Config.auth[provider as AuthProviderID] &&
		Config.auth[provider as AuthProviderID].isEnabled
) as AuthProviderID[];


const NotLoggedIn = (
	{
		enabledProviders,
		onLogin,
	}: {
		enabledProviders: AuthProviderID[];
		onLogin: (args: {provider: AuthProviderID;}) => void;
	}
) => {
	const intl = useIntl();

	const loginMethods: Partial<Record<AuthProviderID, () => void>> = {};

	/**
	 * Handles the click of a Login button.
	 */
	const handleLoginClicked = useCallback(
		({ provider }: { provider: AuthProviderID }) => {
			onLogin({ provider });
		},
		[
			onLogin,
		]
	);

	return (
		<div>
			{
				Object.keys(PROVIDER_INFO).map(
					(p) => {
						const provider = p as AuthProviderID;
						if (!enabledProviders.includes(provider)) {
							return null;
						}

						/* istanbul ignore else */
						if (!loginMethods[provider]) {
							loginMethods[provider] = handleLoginClicked.bind(
								this,
								{
									provider: provider as AuthProviderID,
								}
							);
						}

						const logInWithMessage = intl.formatMessage(
							{
								id: "quintro.components.AccountDialog.actions.logInWith",
								defaultMessage: "Log in with {provider}",
							},
							{
								provider: PROVIDER_INFO[provider].name,
							},
						); 

						return (
							<IconButton
								key={provider}
								className={styles.loginLink}
								title={logInWithMessage}
								aria-label={logInWithMessage}
								onClick={loginMethods[provider]}
							>
								<Icon
									className="icon"
								>
									{PROVIDER_INFO[provider].ligature}
								</Icon>
							</IconButton>
						);
					}
				)
			}
		</div>
	);
};

/**
 * Represents the dialog shown to allow users to manage their site account (log in/out, edit profile, etc.).
 */
export const AccountDialog = (
	{
		loggedInUser,
		enabledProviders = defaultEnabledProviders,
	}: {
		loggedInUser?: User;
		enabledProviders?: Array<AuthProviderID>;
	}
) => {
	const onLogin = useCallback(
		(_: { provider: AuthProviderID }) => {
		},
		[]
	);
	
	const onLogout = useCallback(
		() => {
		},
		[]
	);

	/**
	 * Handles the click of the Logout button.
	 */
	const handleLogoutButtonClicked = useCallback(
		() => {
			onLogout();
		},
		[
			onLogout,
		]
	);

	const title = loggedInUser ? (
		<div>
			{
				loggedInUser.provider == null ? null : (
					<Icon
						className={styles.providerIcon}
					>
						{PROVIDER_INFO[loggedInUser.provider].ligature}
					</Icon>
				)
			}
			<Link
				to={`/profile/${loggedInUser.id}`}
			>
				{loggedInUser.name.display}
			</Link>
		</div>
	) : (
		<FormattedMessage
			id="quintro.general.actions.logIn"
			defaultMessage="Log in"
		/>
	)

	return (
		<Card>
			<CardHeader
				title={title}
			>
			</CardHeader>
			<CardContent>
				{
					loggedInUser ?
						null :
						(
							<NotLoggedIn
								onLogin={onLogin}
								enabledProviders={enabledProviders}
							/>
						)
				}
			</CardContent>
			{
				loggedInUser && (
					<CardActions>
						<Button
							onClick={handleLogoutButtonClicked}
						>
							<Icon
								className={styles.buttonIcon}
							>
								log out
							</Icon>
							<FormattedMessage
								id="quintro.general.actions.logOut"
								defaultMessage="Log out"
							/>
						</Button>
					</CardActions>
				)
			}
		</Card>
	);
};
