import { compose }      from "redux";
import { connect }      from "react-redux";
import { Map, List }    from "immutable";
import injectSaga       from "@app/utils/injectSaga";
import {
	games as gameSelectors
}                       from "@app/selectors";
import {
	getUserGames
}                       from "@app/actions";
import UserGamesList    from "@app/components/UserGamesList";
import saga             from "./saga";

const withRedux = connect(
	function mapStateToProps(state) {
		const games = state.get("games");
		const userGames = games ? games.get("items", Map()).toList() : List();

		return {
			userGames,
			playersByGame: userGames && Map(
				userGames.reduce(
					(gamesToPlayers, game) => {
						let players = gameSelectors.getPlayers(state, { gameName: game.get("name") });

						if (players) {
							gamesToPlayers[game.get("name")] = players;
						}

						return gamesToPlayers;
					},
					{}
				)
			)
		};
	},

	function mapDispatchToProps(dispatch) {
		return {
			onGetUserGames() {
				dispatch(getUserGames());
			},
		};
	}
);

const withSaga = injectSaga({
	key: "UserGamesListContainer",
	saga,
});

const UserGamesListContainer = compose(
	withSaga,
	withRedux
)(UserGamesList);

UserGamesListContainer.displayName = "UserGamesListContainer";

export default UserGamesListContainer;
