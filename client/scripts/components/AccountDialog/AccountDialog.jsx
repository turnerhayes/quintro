import React      from "react";
import PropTypes  from "prop-types";
import { Link }   from "react-router-dom";
import createHelper from "project/scripts/components/class-helper";
import Icon       from "material-ui/Icon";
import IconButton from "material-ui/IconButton";
import UserRecord from "project/scripts/records/user";
import {
	login,
	logout
}                 from "project/scripts/redux/actions";
import Config     from "project/scripts/config";
import                 "./AccountDialog.less";

const classes = createHelper("account-dialog");

const PROVIDER_INFO = {
	facebook: {
		iconClass: "fa-facebook-square",
		id: "facebook",
		name: "Facebook",
	},
	google: {
		iconClass: "fa-google-plus-square",
		id: "google",
		name: "Google+",
	},
	twitter: {
		iconClass: "fa-twitter-square",
		id: "twitter",
		name: "Twitter",
	},
};

/**
 * Represents the dialog shown to allow users to manage their site account (log in/out, edit profile, etc.).
 *
 * @memberof client.react-components
 */
class AccountDialog extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {function} dispatch - function to dispatch actions to the Redux store
	 * @prop {client.records.UserRecord} [loggedInUser] - the currently logged in user, if any
	 * @prop {string} [className] - the class(es) to add to the dialog
	 */
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		loggedInUser: PropTypes.instanceOf(UserRecord),
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
		this.props.dispatch(logout());
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
		this.props.dispatch(login({ provider }));
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
										className={`fa ${PROVIDER_INFO[provider].iconClass}`}
									/>
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
		return (
			<div
				{...classes()}
			>
				{
					<h4
						className="d-flex justify-content-space-between align-items-center"
					>
						{
							this.props.loggedInUser &&
							PROVIDER_INFO[this.props.loggedInUser.provider] && (
								<span
									className={`fa ${PROVIDER_INFO[this.props.loggedInUser.provider].iconClass} provider-icon`}
								></span>
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
							!this.props.loggedInUser && "Log in"
						}
					</h4>
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
