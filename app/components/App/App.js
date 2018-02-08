import React                        from "react";
import { Switch, Route }            from "react-router-dom";
import { Loadable as NotFoundPage } from "@app/components/NotFoundPage";
import { Loadable as HomePage }     from "@app/components/HomePage";
import FindGame                     from "@app/containers/FindGame";
import CreateGame                   from "@app/containers/CreateGame";
import HowToPlay                    from "@app/components/HowToPlay";
import UserGamesList                from "@app/containers/UserGamesList";
import TopNavigation                from "@app/containers/TopNavigation";
import                                   "./App.less";

/**
 * Root application component.
 *
 * @memberof client.react-components
 */
class App extends React.Component {
	sidebarRoute = (Component, path) => {
		return (
			<Route exact path={path}
				render={(props) => (
					<aside
						className="page-layout__left-panel"
					>
						<Component {...props} />
					</aside>
				)}
			/>
		);
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
							<Route exact path="/game/create" component={CreateGame} />
							<Route exact path="/how-to-play" component={HowToPlay} />
							<Route component={NotFoundPage} />
						</Switch>
					</article>
					<Switch>
						{this.sidebarRoute(UserGamesList, "/")}
					</Switch>
				</div>
			</section>
		);
	}
}

export default App;
