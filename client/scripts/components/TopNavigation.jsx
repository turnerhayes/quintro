import React                from "react";
import { connect }          from "react-redux";
import PropTypes            from "prop-types";
import { Link }             from "react-router-dom";
import {
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem
}                           from "reactstrap";
import AccountDialog        from "project/scripts/components/AccountDialog";
import QuickSettingsDialog  from "project/scripts/components/QuickSettingsDialog";
import UserRecord           from "project/scripts/records/user";
import                           "bootstrap/dist/css/bootstrap.css";

class TopNavigation extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		currentUser: PropTypes.instanceOf(UserRecord)
	}

	state = {
		accountDialogIsOpen: false,
		quickSettingsDialogIsOpen: false
	}

	toggleAccountDialog = () => {
		const state = {
			accountDialogIsOpen: !this.state.accountDialogIsOpen
		};

		if (state.accountDialogIsOpen && this.state.quickSettingsDialogIsOpen) {
			state.quickSettingsDialogIsOpen = false;
		}

		this.setState(state);
	}

	toggleQuickSettingsDialog = () => {
		const state = {
			quickSettingsDialogIsOpen: !this.state.quickSettingsDialogIsOpen
		};

		if (state.quickSettingsDialogIsOpen && this.state.accountDialogIsOpen) {
			state.accountDialogIsOpen = false;
		}

		this.setState(state);
	}

	render() {
		const loggedInUser = this.props.currentUser && !this.props.currentUser.isAnonymous ?
			this.props.currentUser :
			null;

		return (
			<nav className="top-nav navbar navbar-toggleable navbar-inverse bg-inverse">
				<Link
					className="navbar-brand"
					to="/"
				>Quintro</Link>
				<ul className="navbar-nav">
					<li
						className="nav-item"
					>
						<Link
							to="/game/find"
							className="nav-link"
						>
							Find a Game
						</Link>
					</li>
					<li
						className="nav-item"
					>
						<Link
							to="/how-to-play"
							className="nav-link"
						>
							How to Play
						</Link>
					</li>
					<li
						className="nav-item"
					>
						<Link
							to="/game/create"
							className="nav-link"
						>
							Start a Game
						</Link>
					</li>
				</ul>
				
				<Dropdown
					isOpen={this.state.accountDialogIsOpen}
					toggle={this.toggleAccountDialog}
					className="nav-item dropdown ml-auto"
				>
					<DropdownToggle
						caret
					>
						{
							loggedInUser ?
								((loggedInUser.name && loggedInUser.name.get("display")) || "Account") :
								"Log in"
						}
					</DropdownToggle>
					<DropdownMenu
						right
					>
						<DropdownItem
							tag="div"
							header
						>
							<AccountDialog
								dispatch={this.props.dispatch}
								isOpen={this.state.accountDialogIsOpen}
								loggedInUser={loggedInUser}
							/>
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				<Dropdown
					isOpen={this.state.quickSettingsDialogIsOpen}
					toggle={this.toggleQuickSettingsDialog}
					className="nav-item dropdown"
				>
					<DropdownToggle
						caret
					>
						<span
							className="fa fa-gear"
						/>
					</DropdownToggle>
					<DropdownMenu
						right
					>
						<DropdownItem
							tag="div"
							header
						>
							<QuickSettingsDialog
							/>
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</nav>
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
