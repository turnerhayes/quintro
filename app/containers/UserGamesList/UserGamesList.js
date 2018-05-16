import { compose }      from "redux";
import { connect }      from "react-redux";
import injectSaga       from "@app/utils/injectSaga";
import selectors        from "@app/selectors";
import {
	getUserGames
}                       from "@app/actions";
import UserGamesList    from "@app/components/UserGamesList";
import saga             from "./saga";

const withRedux = connect(
	function mapStateToProps(state) {
		const users = selectors.users.getUsers(state);

		const userGames = selectors.games.getGames(state).toList()
			.filter(
				(game) => game.get("players").find(
					(player) => users.getIn([ player.get("userID"), "isMe" ])
				)
			);

		return {
			userGames,
			users,
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
