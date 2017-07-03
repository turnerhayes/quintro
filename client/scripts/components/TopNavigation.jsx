import React                from "react";
import { connect }          from "react-redux";
import PropTypes            from "prop-types";
import { Link }             from "react-router-dom";
import UserRecord           from "project/scripts/records/user";

class TopNavigation extends React.Component {
	static propTypes = {
		currentUser: PropTypes.instanceOf(UserRecord)
	}

	render() {
		return (
			<nav className="top-nav navbar navbar-default">
				<div className="container-fluid">
					<div className="navbar-header">
						<Link
							className="navbar-brand"
							to="/"
						>Quintro</Link>
					</div>
					<ul className="nav navbar-nav">
						<li>
							<Link to="/game/find">
								Find a Game
							</Link>
						</li>
						<li>
							<Link to="/how-to-play">
								How to Play
							</Link>
						</li>
						<li>
							<Link to="/game/create">
								Start a Game
							</Link>
						</li>
					</ul>
					<p className="navbar-text navbar-right">
						{
							this.props.currentUser &&
								(<span>Logged in as </span>)
						}
						{
							this.props.currentUser &&
								(<Link to="/profile">
									{this.props.currentUser.name.get("display")}
								</Link>)
						}
						{
							this.props.currentUser ?
								null :
								(<Link to="/login">Log in</Link>)
						}
					</p>
				</div>
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
