import React, { useCallback }              from "react";
import classnames         from "classnames";
import Button             from "@mui/material/Button";
import Icon               from "@mui/material/Icon";
import IconButton         from "@mui/material/IconButton";
import Card               from "@mui/material/Card";
import CardContent        from "@mui/material/CardContent";
import CardHeader         from "@mui/material/CardHeader";
import CardActions        from "@mui/material/CardActions";
import Link from "next/link";
import Config             from "@app/config";
import                         "@app/fonts/icomoon/style.css";
import { User } from "@shared/user";


const PROVIDER_INFO = {
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

interface AccountDialogProps {
	onLogin?: ({provider}: {provider: string;}) => void;
	onLogout?: () => void;
	loggedInUser?: User;
	enabledProviders?: Array<keyof typeof PROVIDER_INFO>;
	className?: string;
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
	enabledProviders = Object.keys(PROVIDER_INFO).filter(
		(provider) => Config.auth[provider] && Config.auth[provider].isEnabled
	) as Array<keyof typeof PROVIDER_INFO>,
	className,
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

	const title = loggedInUser ? (
		<div>
			<Icon
				className={classnames(
					"icon",
					classes.providerIcon,
				)}
			>
				{PROVIDER_INFO[loggedInUser.provider].ligature}
			</Icon>
			<Link
				href={`/profile/${loggedInUser.username}`}
			>
				{loggedInUser.name.display}
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
									Object.keys(PROVIDER_INFO).map(
										(provider: keyof typeof PROVIDER_INFO) => {
											if (!enabledProviders.includes(provider)) {
												return null;
											}
				
											/* istanbul ignore else */
											if (!loginMethods[provider]) {
												loginMethods[provider] = handleLoginClicked.bind(this, { provider });
											}
				
											const logInWithMessage = intl.formatMessage({
												id: "quintro.components.AccountDialog.actions.logInWith",
												description: "Title for the icon button used to log in with a particular authentication provider",
												defaultMessage: "Log in with {provider}",
											}, {
												provider: PROVIDER_INFO[provider].name
											});
				
											return (
												<IconButton
													key={provider}
													className={classes.loginLink}
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
