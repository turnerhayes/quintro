import React                from "react";
import { connect }          from "react-redux";
import PropTypes            from "prop-types";
import { Link }             from "react-router-dom";
import UserRecord           from "project/scripts/records/user";
import                           "bootstrap/dist/css/bootstrap.css";

class TopNavigation extends React.Component {
	static propTypes = {
		currentUser: PropTypes.instanceOf(UserRecord)
	}

	render() {
		const loggedInUser = this.props.currentUser && !this.props.currentUser.isAnonymous ?
			this.props.currentUser :
			null;

		return (
			<nav className="top-nav navbar fixed-top navbar-toggleable navbar-inverse bg-inverse">
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
				<span className="navbar-text ml-auto">
					{
						loggedInUser &&
							(<span>Logged in as </span>)
					}
					{
						loggedInUser &&
							(<Link to="/profile">
								{loggedInUser.name.get("display")}
							</Link>)
					}
					{
						loggedInUser ?
							null :
							(<Link to="/login">Log in</Link>)
					}
				</span>
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
