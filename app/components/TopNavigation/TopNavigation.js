import React                from "react";
import PropTypes            from "prop-types";
import ImmutablePropTyps    from "react-immutable-proptypes";
import { Link }             from "react-router-dom";
import createHelper         from "project/app/components/class-helper";
import AppBar               from "material-ui/AppBar";
import Toolbar              from "material-ui/Toolbar";
import Button               from "material-ui/Button";
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
				</Toolbar>
			</AppBar>
		);
	}
}

export default TopNavigation;
