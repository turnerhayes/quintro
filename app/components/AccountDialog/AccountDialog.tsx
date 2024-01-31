import React, { useCallback }              from "react";
import { FormattedMessage, useIntl } from "react-intl";
import Link from "next/link";
import classnames         from "classnames";
import {
	Button,
	Icon,
	IconButton,
	Card,
	CardContent,
	CardHeader,
	CardActions,
} from "@mui/material";
import {
	Facebook as FacebookIcon,
	Google as GoogleIcon
} from "@mui/icons-material";
import                         "@app/fonts/icomoon/style.css";
import { AuthProvider, QuintroUser, ProviderInfo } from "@shared/config";


type OnLoginCallback = ({provider}: {provider: ProviderInfo;}) => void;

const PROVIDER_ICONS = {
	[AuthProvider.GOOGLE]: (<GoogleIcon />),
	[AuthProvider.FACEBOOK]: (<FacebookIcon />),
};

const styles = {
	loginLink: {
		fontSize: "2em",
	},

	providerIcon: {
		marginRight: "0.5em",
	},

	buttonIcon: {
		marginRight: "1em",
		fontSize: "2em",
	},
};

const LoginButton = ({
	provider,
	title,
	onLogin,
}: {
	provider: ProviderInfo;
	title: string;
	onLogin: OnLoginCallback;
}) => {
	const handleClick = useCallback(() => {
		onLogin({provider});
	}, [onLogin, provider]);

	return (
		<IconButton
			title={title}
			aria-label={title}
			onClick={handleClick}
		>
			<Icon
				className="icon"
			>
				{PROVIDER_ICONS[provider.id]}
			</Icon>
		</IconButton>
	);
};

interface AccountDialogProps {
	onLogin: OnLoginCallback;
	onLogout: () => void;
	loggedInUser?: QuintroUser;
	enabledProviders: ProviderInfo[];
	classes?: {
		loginLink: string;
		providerIcon: string;
		buttonIcon: string;
	}
}

/**
 * Represents the dialog shown to allow users to manage their site account (log in/out, edit profile, etc.).
 *
 * @memberof client.react-components
 */
const AccountDialog = ({
	onLogin,
	onLogout,
	loggedInUser,
	enabledProviders,
	classes = {
		loginLink: "loginLink",
		providerIcon: "providerIcon",
		buttonIcon: "buttonIcon",
	},
}: AccountDialogProps) => {
	const intl = useIntl();

	const loginMethods = {};

	/**
	 * Handles the click of the Logout button.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const handleLogoutButtonClicked = useCallback(() => {
		if (onLogout) {
			onLogout();
		}
	}, [onLogout]);

	/**
	 * Handles the click of a Login button.
	 *
	 * @function
	 *
	 * @param {object} args - the function arguments
	 * @param {string} args.provider - the name of the credential provider to use (e.g. "facebook", "twitter")
	 *
	 * @return {void}
	 */
	const handleLoginClicked = useCallback(({ provider }) => {
		if (onLogin) {
			onLogin({ provider });
		}
	}, [onLogin]);

	const userProvider = loggedInUser ?
		enabledProviders.find(({id}) => id === loggedInUser.id) :
		null;

	const title = loggedInUser ? (
		<div>
			<Icon
				className={classnames(
					"icon",
					classes.providerIcon,
				)}
			>
				{PROVIDER_ICONS[userProvider!.id]}
			</Icon>
			<Link
				href={`/profile/${loggedInUser.username}`}
			>
				{loggedInUser.names?.display ?? "Unnamed User"}
			</Link>
		</div>
	) : (
		<FormattedMessage
			id="quintro.general.actions.logIn"
			description="Title for the login link on the account dialog"
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
							<div>
								{
									enabledProviders.map(
										(provider) => {
											if (!enabledProviders.map(({id}) => id).includes(provider.id)) {
												return null;
											}
				
											/* istanbul ignore else */
											if (!loginMethods[provider.id]) {
												loginMethods[provider.id] = handleLoginClicked.bind(this, { provider });
											}
				
											const logInWithMessage = intl.formatMessage({
												id: "quintro.components.AccountDialog.actions.logInWith",
												description: "Title for the icon button used to log in with a particular authentication provider",
												defaultMessage: "Log in with {provider}",
											}, {
												provider: provider.name
											});
				
											return (
												<LoginButton
													key={provider.id}
													provider={provider}
													title={logInWithMessage}
													onLogin={onLogin}
												></LoginButton>
											);
										}
									)
								}
							</div>
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
								className={classnames(
									"icon",
									classes.buttonIcon
								)}
							>
								log out
							</Icon>
							<FormattedMessage
								id="quintro.general.actions.logOut"
								description="Button text for the log out button"
								defaultMessage="Log out"
							/>
						</Button>
					</CardActions>
				)
			}
		</Card>
	);
}

export default AccountDialog;
