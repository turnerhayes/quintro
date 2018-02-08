import React                from "react";
import PropTypes            from "prop-types";
import ImmutablePropTyps    from "react-immutable-proptypes";
import { Link }             from "react-router-dom";
import { Map }              from "immutable";
import AppBar               from "material-ui/AppBar";
import Toolbar              from "material-ui/Toolbar";
import Popover              from "material-ui/Popover";
import Card, {
	CardContent
}                           from "material-ui/Card";
import Button               from "material-ui/Button";
import IconButton           from "material-ui/IconButton";
import AccountCircleIcon    from "material-ui-icons/AccountCircle";
import createHelper         from "@app/components/class-helper";
import AccountDialog        from "@app/containers/AccountDialog";
import                           "./TopNavigation.less";

const classes = createHelper("top-navigation");

/**
 * Component representing the navigation bar on the top of the page.
 *
 * @class
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class TopNavigation extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {client.records.UserRecord} currentUser - the logged in user, if any
	 */
	static propTypes = {
		currentUser: ImmutablePropTyps.map,
		className: PropTypes.string,
		isAccountDialogOpen: PropTypes.bool,
		onAccountButtonClick: PropTypes.func.isRequired,
		onAccountDialogClose: PropTypes.func.isRequired,
	}

	static defaultProps = {
		isAccountDialogOpen: false,
	}

	state = {
		accountButtonEl: null,
	}

	onAccountButtonClick = (event) => {
		this.setState({
			accountButtonEl: event.target,
		});

		this.props.onAccountButtonClick(event);
	}

	closeAccountDialog = () => {
		this.props.onAccountDialogClose();
	}

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		const loggedInUser = Map();

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
							element: "account-button"
						})}
						onClick={this.onAccountButtonClick}
					>
						<AccountCircleIcon />
					</IconButton>
					<Popover
						open={this.props.isAccountDialogOpen}
						onClose={() => this.closeAccountDialog()}
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
									isOpen={this.state.accountDialogIsOpen}
									loggedInUser={loggedInUser}
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
