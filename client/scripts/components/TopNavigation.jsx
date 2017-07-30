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
import UserRecord           from "project/scripts/records/user";
import                           "bootstrap/dist/css/bootstrap.css";

class TopNavigation extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		currentUser: PropTypes.instanceOf(UserRecord)
	}

	state = {
		accountDialogIsOpen: false
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
					toggle={() => this.setState({ accountDialogIsOpen: !this.state.accountDialogIsOpen })}
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
