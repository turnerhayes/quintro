import UserGamesList    from "project/app/components/UserGamesList";
import { connect }      from "react-redux";
import { Map }          from "immutable";
import { getUserGames } from "project/app/actions";
import {
	playerSelector
}                       from "project/app/selectors";

const UserGamesListContainer = connect(
	function mapStateToProps(state) {
		const games = state.get("games");
		const userGames = games && games.userGames;

		return {
			userGames,
			playersByGame: userGames && Map(
				userGames.reduce(
					(gamesToPlayers, game) => {
						let players = playerSelector(state, { players: game.players });

						if (players) {
							gamesToPlayers[game.name] = players;
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
)(UserGamesList);

UserGamesListContainer.displayName = "UserGamesListContainer";

export default UserGamesListContainer;
