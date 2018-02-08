import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import UserGamesList      from "@app/containers/UserGamesList";

/**
 * Component representing the home page.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class Home extends React.PureComponent {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {external:Immutable.Map} [currentUser] - the user that is currently logged in, if any
	 * @prop {Types.RenderableElement} [children=[]] - child(ren) of the component
	 */
	static propTypes = {
		currentUser: ImmutablePropTypes.map,
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

export default Home;
