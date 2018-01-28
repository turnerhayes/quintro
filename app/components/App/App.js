import React          from "react";
import PropTypes      from "prop-types";
import { withRouter } from "react-router";
import { Switch, Route } from "react-router-dom";
import { Loadable as NotFoundPage } from "../NotFoundPage";
import { Loadable as HomePage } from "../HomePage";
import FindGame from "../../containers/FindGame";
import TopNavigation  from "../TopNavigation";
import                     "./App.less";

/**
 * Root application component.
 *
 * @memberof client.react-components
 */
class App extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {Types.RenderableElement} [children=[]] - child(ren) of the component
	 * @prop {external:React.Component} [sidebar] - Component to render in the sidebar
	 */
	static propTypes = {
		sidebar: PropTypes.element
	}

	/**
	 * Generates a React component representing the application.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		return (
			<section
				className="page-layout__main-container"
			>
				<header
					className="page-layout__main-header"
				>
					<TopNavigation
					/>
				</header>
				<div
					className="page-layout__main-content-container"
				>
					<article
						className="page-layout__main-content"
					>
						<Switch>
							<Route exact path="/" component={HomePage} />
							<Route exact path="/game/find" component={FindGame} />
							<Route component={NotFoundPage} />
						</Switch>
					</article>
					{
						this.props.sidebar && (
							<aside
								className="page-layout__left-panel"
							>{this.props.sidebar}</aside>
						)
					}
				</div>
			</section>
		);
	}
}

export default withRouter(App);
