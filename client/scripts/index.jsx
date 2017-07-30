import ReactDOM         from "react-dom";
import React            from "react";
import { Switch }       from "react-router";
import {
	Route
}                       from "react-router-dom";
import { Provider }     from "react-redux";
import {
	ConnectedRouter
}                       from "react-router-redux";
import { history }      from "project/scripts/redux/configure-store";
import getStore         from "project/scripts/redux/store";
import App              from "project/scripts/components/App";
import Home             from "project/scripts/components/Home";
import CreateGame       from "project/scripts/components/CreateGame";
import FindGame         from "project/scripts/components/FindGame";
import PlayGame         from "project/scripts/components/PlayGame";
import HowToPlay        from "project/scripts/components/HowToPlay";
import UserGamesList    from "project/scripts/components/UserGamesList";


ReactDOM.render(
	<Provider store={getStore()}>
		<ConnectedRouter history={history}>
			<App
				sidebar={
					<Route
						exact
						name="Home"
						path="/"
						component={UserGamesList}
					></Route>
				}
			>
				<Route
					exact
					name="Home"
					path="/"
					component={Home}
				>
				</Route>
				<Route
					exact
					name="How to Play"
					path="/how-to-play"
					component={HowToPlay}
				>
				</Route>
				<Switch>
					<Route
						exact
						name="Create Game"
						path="/game/create"
						component={CreateGame}
					/>
					<Route
						exact
						name="Find a Game"
						path="/game/find"
						render={(...args) => (
								<FindGame
									{...args}
								></FindGame>
							)
						}
					>
					</Route>
					<Route
						name="Play Game"
						path="/play/:name"
						render={
							({ match }) => {
								return (
									<PlayGame
										gameName={match.params.name}
									/>
								);
							}
						}
					/>
				</Switch>
			</App>
		</ConnectedRouter>
	</Provider>,
	document.getElementById("app")
);
