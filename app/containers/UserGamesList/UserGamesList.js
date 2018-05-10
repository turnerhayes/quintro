import { compose }      from "redux";
import { connect }      from "react-redux";
import { Map, Set, List }    from "immutable";
import injectSaga       from "@app/utils/injectSaga";
import selectors        from "@app/selectors";
import {
	getUserGames
}                       from "@app/actions";
import UserGamesList    from "@app/components/UserGamesList";
import saga             from "./saga";

const withRedux = connect(
	function mapStateToProps(state) {
		const games = state.get("games");
		const userGames = games ? games.get("items", Map()).toList() : List();

		const userIDs = [];

		userGames && userGames.forEach(
			(game) => {
				let players = selectors.games.getPlayers(state, { gameName: game.get("name") });

				userIDs.push(...players.map((player) => player.get("userID")).toArray());
			},
		);

		return {
			userGames,
			usersById: selectors.users.filterUsers(state, { userIDs: Set(userIDs) })
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
