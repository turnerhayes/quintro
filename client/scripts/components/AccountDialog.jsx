import React      from "react";
import PropTypes  from "prop-types";
import { Link }   from "react-router-dom";
import UserRecord from "project/scripts/records/user";
import {
	login,
	logout
}                 from "project/scripts/redux/actions";
import Config     from "project/scripts/config";
import                 "project/styles/account-dialog.less";

const PROVIDER_ICON_MAP = {
	facebook: "fa-facebook-square",
	google: "fa-google-plus-square",
	twitter: "fa-twitter-square"
};

export default class AccountDialog extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		loggedInUser: PropTypes.instanceOf(UserRecord),
		className: PropTypes.string
	}

	handleLogoutButtonClicked = () => {
		this.props.dispatch(logout());
	}

	handleLoginClicked = ({ provider }) => {
		this.props.dispatch(login({ provider }));
	}

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

	renderNotLoggedIn = () => {
		return (
			<div>
				{
					Config.auth.facebook.isEnabled && (
						<button
							className={`btn btn-link fa ${PROVIDER_ICON_MAP.facebook} login-link`}
							title="Log in with Facebook"
							aria-label="Log in with Facebook"
							onClick={() => this.handleLoginClicked({ provider: "facebook" })}
						></button>
					)
				}
				{
					Config.auth.google.isEnabled && (
						<button
							className={`btn btn-link fa ${PROVIDER_ICON_MAP.google} login-link`}
							title="Log in with Google"
							aria-label="Log in with Google"
							onClick={() => this.handleLoginClicked({ provider: "google" })}
						></button>
					)
				}
				{
					Config.auth.twitter.isEnabled && (
						<button
							className={`btn btn-link fa ${PROVIDER_ICON_MAP.twitter} login-link`}
							title="Log in with Google"
							aria-label="Log in with Google"
							onClick={() => this.handleLoginClicked({ provider: "twitter" })}
						></button>
					)
				}
			</div>
		);
	}

	render() {
		return (
			<div
				className="c_account-dialog"
			>
				{
					<h4
						className="d-flex justify-content-space-between align-items-center"
					>
						{
							this.props.loggedInUser &&
							PROVIDER_ICON_MAP[this.props.loggedInUser.provider] && (
								<span
									className={`fa ${PROVIDER_ICON_MAP[this.props.loggedInUser.provider]} provider-icon`}
								></span>
							)
						}
						{
							this.props.loggedInUser && this.props.loggedInUser.name.get("display")
						}
						{
							this.props.loggedInUser && (
								<button
									type="button"
									className="btn btn-secondary fa fa-sign-out ml-sm-5"
									aria-label="Log out"
									title="Log out"
									onClick={this.handleLogoutButtonClicked}
								></button>
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
