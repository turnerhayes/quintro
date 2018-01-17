import React                from "react";
import { connect }          from "react-redux";
import PropTypes            from "prop-types";
import { Link }             from "react-router-dom";
import createHelper         from "project/scripts/components/class-helper";
import AppBar               from "material-ui/AppBar";
import Toolbar              from "material-ui/Toolbar";
import Popover              from "material-ui/Popover";
import Card, {
	CardContent
}                           from "material-ui/Card";
import Button               from "material-ui/Button";
import IconButton           from "material-ui/IconButton";
import AccountBoxIcon       from "material-ui-icons/AccountBox";
import SettingsIcon         from "material-ui-icons/Settings";
import AccountDialog        from "project/scripts/components/AccountDialog";
import QuickSettingsDialog  from "project/scripts/components/QuickSettingsDialog";
import UserRecord           from "project/scripts/records/user";
import                           "./TopNavigation.less";

const classes = createHelper("top-navigation");

/**
 * Component representing the navigation bar on the top of the page.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class TopNavigation extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {function} dispatch - function to dispatch actions to the Redux store
	 * @prop {client.records.UserRecord} currentUser - the logged in user, if any
	 */
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		currentUser: PropTypes.instanceOf(UserRecord),
		className: PropTypes.string,
	}

	/**
	 * Component state
	 *
	 * @type object
	 *
	 * @prop {boolean} accountDialogIsOpen=false - whether or not the dialog for interacting with the user's
	 *	account (log out/in, etc.) is open
	 * @prop {boolean} quickSettingsDialogIsOpen=false - whether or not the dialog for managing certain settings
	 *	is open
	 */
	state = {
		accountDialogIsOpen: false,
		quickSettingsDialogIsOpen: false,
		accountButtonEl: null,
		settingsButtonEl: null,
	}

	/**
	 * Toggles whether or not the account dialog is open.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	toggleAccountDialog = (isOpen) => {
		const state = {
			accountDialogIsOpen: isOpen === undefined ? !this.state.accountDialogIsOpen : isOpen,
		};

		if (state.accountDialogIsOpen && this.state.quickSettingsDialogIsOpen) {
			state.quickSettingsDialogIsOpen = false;
		}

		this.setState(state);
	}

	/**
	 * Toggles whether or not the quick settings dialog is open.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	toggleQuickSettingsDialog = (isOpen) => {
		const state = {
			quickSettingsDialogIsOpen: isOpen === undefined ? !this.state.quickSettingsDialogIsOpen : isOpen,
		};

		if (state.quickSettingsDialogIsOpen && this.state.accountDialogIsOpen) {
			state.accountDialogIsOpen = false;
		}

		this.setState(state);
	}

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		const loggedInUser = this.props.currentUser && !this.props.currentUser.isAnonymous ?
			this.props.currentUser :
			null;

		return (
			<AppBar
				{...classes({
					extra: [ this.props.className ],
				})}
				position="static"
			>
				<Toolbar>
					<Link
						to="/"
					>
						Home
					</Link>
					<Button
						component={Link}
						to="/game/find"
						className="nav-link"
					>
						Find a Game
					</Button>
					<Button
						component={Link}
						to="/how-to-play"
						className="nav-link"
					>
						How to Play
					</Button>
					<Button
						component={Link}
						to="/game/create"
						className="nav-link"
					>
						Start a Game
					</Button>
					<IconButton
						{...classes({
							element: "account-button",
						})}
						onClick={({ target }) => this.setState({
							accountButtonEl: target,
							accountDialogIsOpen: true,
							quickSettingsDialogIsOpen: false,
						})}
					>
						<AccountBoxIcon />
					</IconButton>
					<Popover
						open={this.state.accountDialogIsOpen}
						onClose={() => this.toggleAccountDialog(false)}
						anchorEl={this.state.accountButtonEl}
						anchorOrigin={{
							horizontal: "right",
							vertical: "bottom",
						}}
						transformOrigin={{
							horizontal: "right",
							vertical: "top",
						}}
					>
						<Card>
							<CardContent>
								<AccountDialog
									dispatch={this.props.dispatch}
									isOpen={this.state.accountDialogIsOpen}
									loggedInUser={loggedInUser}
								/>
							</CardContent>
						</Card>
					</Popover>
					<IconButton
						onClick={({ target }) => this.setState({
							settingsButtonEl: target,
							quickSettingsDialogIsOpen: true,
							accountDialogIsOpen: false,
						})}
					>
						<SettingsIcon />
					</IconButton>
					<Popover
						open={this.state.quickSettingsDialogIsOpen}
						onClose={() => this.toggleQuickSettingsDialog(false)}
						anchorEl={this.state.settingsButtonEl}
						anchorOrigin={{
							horizontal: "right",
							vertical: "bottom",
						}}
						transformOrigin={{
							horizontal: "right",
							vertical: "top",
						}}
					>
						<Card>
							<CardContent>
								<QuickSettingsDialog
								/>
							</CardContent>
						</Card>
					</Popover>
				</Toolbar>
			</AppBar>
		);
	}
}

export default connect(
	state => {
		const currentUser = state.get("users").currentUser;

		return {
			currentUser
		};
	}
)(TopNavigation);
