import React                from "react";
import PropTypes            from "prop-types";
import ImmutablePropTyps    from "react-immutable-proptypes";
import { Link }             from "react-router-dom";
import AppBar               from "material-ui/AppBar";
import Toolbar              from "material-ui/Toolbar";
import Popover              from "material-ui/Popover";
import Card, {
	CardContent
}                           from "material-ui/Card";
import Button               from "material-ui/Button";
import IconButton           from "material-ui/IconButton";
import HomeIcon             from "material-ui-icons/Home";
import AccountCircleIcon    from "material-ui-icons/AccountCircle";
import SettingsIcon         from "material-ui-icons/Settings";
import createHelper         from "@app/components/class-helper";
import AccountDialog        from "@app/containers/AccountDialog";
import QuickSettingsDialog  from "@app/containers/QuickSettingsDialog";
import                           "./TopNavigation.less";

const classes = createHelper("top-navigation");

/**
 * Component representing the navigation bar on the top of the page.
 *
 * @class
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
class TopNavigation extends React.PureComponent {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {!external:Immutable.Map} loggedInUser - the logged in user, if any
	 */
	static propTypes = {
		loggedInUser: ImmutablePropTyps.map,
		className: PropTypes.string,
	}

	state = {
		accountButtonEl: null,
		quickSettingsButtonEl: null,
	}

	/**
	 * Handles a click of the Account button.
	 *
	 * @function
	 * @private
	 *
	 * @param {React.Event} event - the event for the click
	 *
	 * @returns {void}
	 */
	onAccountButtonClick = (event) => {
		this.setState({
			accountButtonEl: event.target,
		});
	}

	closeAccountDialog = () => {
		this.setState({
			accountButtonEl: null,
		});
	}

	/**
	 * Handles a click of the Quick Settings button.
	 *
	 * @function
	 * @private
	 *
	 * @param {React.Event} event - the event for the click
	 *
	 * @returns {void}
	 */
	onQuickSettingsButtonClick = (event) => {
		this.setState({
			quickSettingsButtonEl: event.target,
		});
	}

	closeQuickSettingsDialog = () => {
		this.setState({
			quickSettingsButtonEl: null,
		});
	}

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
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
						<HomeIcon
							title="Home"
						/>
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
							element: "account-button"
						})}
						onClick={this.onAccountButtonClick}
					>
						<AccountCircleIcon />
					</IconButton>
					<Popover
						open={!!this.state.accountButtonEl}
						onClose={this.closeAccountDialog}
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
									loggedInUser={this.props.loggedInUser}
								/>
							</CardContent>
						</Card>
					</Popover>
					<IconButton
						onClick={this.onQuickSettingsButtonClick}
					>
						<SettingsIcon />
					</IconButton>
					<Popover
						open={!!this.state.quickSettingsButtonEl}
						onClose={this.closeQuickSettingsDialog}
						anchorEl={this.state.quickSettingsButtonEl}
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

export default TopNavigation;
