import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { Link }           from "react-router-dom";
import createHelper       from "@app/components/class-helper";
import Icon               from "material-ui/Icon";
import IconButton         from "material-ui/IconButton";
import Typography         from "material-ui/Typography";
import Config             from "@app/config";
import                         "./AccountDialog.less";
import                         "@app/fonts/icomoon/style.css";

const classes = createHelper("account-dialog");

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
	twitter: {
		id: "twitter",
		name: "Twitter",
		ligature: "twitter",
	},
};

/**
 * Represents the dialog shown to allow users to manage their site account (log in/out, edit profile, etc.).
 *
 * @class
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class AccountDialog extends React.PureComponent {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {function} onLogin - function to log in
	 * @prop {function} onLogout - function to log out
	 * @prop {client.records.UserRecord} [loggedInUser] - the currently logged in user, if any
	 * @prop {string} [className] - the class(es) to add to the dialog
	 */
	static propTypes = {
		onLogin: PropTypes.func.isRequired,
		onLogout: PropTypes.func.isRequired,
		loggedInUser: ImmutablePropTypes.map,
		className: PropTypes.string
	}

	/**
	 * Handles the click of the Logout button.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handleLogoutButtonClicked = () => {
		this.props.onLogout();
	}

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
	handleLoginClicked = ({ provider }) => {
		this.props.onLogin({ provider });
	}

	/**
	 * Generates a React component representing the view of the dialog when the user is logged in.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	renderLoggedIn = () => {
		return (
			<div
			>
				<div>
					<Link
						to={`/profile/${this.props.loggedInUser.username}`}
					>
					Profile
					</Link>
				</div>
			</div>
		);
	}

	/**
	 * Generates a React component representing the view of the dialog when the user is not logged in.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	renderNotLoggedIn = () => {
		return (
			<div>
				{
					Object.keys(PROVIDER_INFO).map(
						(provider) => {
							if (!Config.auth[provider].isEnabled) {
								return null;
							}

							return (
								<IconButton
									key={provider}
									className="login-link"
									title={`Log in with ${PROVIDER_INFO[provider].name}`}
									aria-label={`Log in with ${PROVIDER_INFO[provider].name}`}
									onClick={() => this.handleLoginClicked({ provider })}
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
	}

	/**
	 * Generates a React component representing the dialog.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		const title = this.props.loggedInUser ?
			"" :
			"Log in";

		return (
			<div
				{...classes()}
			>
				{
					title && (
						<Typography
							align="center"
							type="title"
						>
						{title}
						</Typography>
					)
				}
				{
					this.props.loggedInUser &&
					PROVIDER_INFO[this.props.loggedInUser.provider] && (
						<Icon>
							{PROVIDER_INFO[this.props.loggedInUser.provider].ligature}
						</Icon>
					)
				}
				{
					this.props.loggedInUser && this.props.loggedInUser.name.get("display")
				}
				{
					this.props.loggedInUser && (
						<IconButton
							aria-label="Log out"
							title="Log out"
							onClick={this.handleLogoutButtonClicked}
						>
							<Icon
								className="fa fa-sign-out"
							/>
						</IconButton>
					)
				}
				{
					this.props.loggedInUser ?
						this.renderLoggedIn() :
						this.renderNotLoggedIn()
				}
			</div>
		);
	}
}

export default AccountDialog;
