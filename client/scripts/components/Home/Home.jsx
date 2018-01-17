import React          from "react";
import PropTypes      from "prop-types";
import { connect }    from "react-redux";
import UserGamesList  from "project/scripts/components/UserGamesList";
import UserRecord     from "project/scripts/records/user";

/**
 * Component representing the home page.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class Home extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {client.records.UserRecord} [currentUser] - the user that is currently logged in, if any
	 * @prop {Types.RenderableElement} [children=[]] - child(ren) of the component
	 */
	static propTypes = {
		currentUser: PropTypes.instanceOf(UserRecord),
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		])
	}

	static defaultProps = {
		children: []
	}

	/**
	 * The React component to show in the page's sidebar
	 *
	 * @type external:React.Component
	 */
	sidebar = (
		<UserGamesList
			user={this.props.currentUser}
		/>
	)

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		return (
			<div
			>
				
			</div>
		);
	}
}

export default connect(
	function mapStateToProps(state) {
		const currentUser = state.get("users").currentUser;

		return {
			currentUser
		};
	}
)(Home);
