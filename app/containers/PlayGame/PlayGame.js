import PlayGame    from "@app/components/PlayGame";
import { compose } from "redux";
import { connect } from "react-redux";
import { goBack }  from "react-router-redux";
import injectSaga  from "@app/utils/injectSaga";
import {
	getGame,
	joinGame,
	watchGame,
	startGame,
	// getUsers,
	// placeMarble,
	// changeUserProfile
}                  from "@app/actions";
import {
	users as userSelectors,
	games as gameSelectors
}                  from "@app/selectors";
import saga        from "./saga";

const withRedux = connect(
	function mapStateToProps(state, ownProps) {
		const game = state.getIn([ "games", "items", ownProps.gameName ]);

		const props = {
			players: userSelectors.playerSelector(state, {
				...ownProps,
				players: game && game.get("players")
			}),

			isInGame: gameSelectors.isInGame(state, { gameName: ownProps.gameName }),

			isWatchingGame: gameSelectors.isWatchingGame(state, { gameName: ownProps.gameName }),
		};

		const getGameError = state.getIn([ "games", "getGameError" ]);

		if (getGameError) {
			props.getGameError = getGameError;
		}
		else {
			props.game = game;
		}

		return props;
	},

	function mapDispatchToProps(dispatch, ownProps) {
		return {
			onGetGame({ gameName }) {
				dispatch(getGame({ name: gameName }));
			},

			onWatchGame() {
				dispatch(watchGame({ gameName: ownProps.gameName }));
			},

			onStartGame() {
				dispatch(startGame({ gameName: ownProps.gameName }));
			},

			onJoinGame({ color }) {
				dispatch(joinGame({ gameName: ownProps.gameName, color }));
			},

			onGetUsers(/*{ userIDs }*/) {
				// dispatch(getUsers({ userIDs }));
			},

			onPlaceMarble(/*{
				gameName,
				position,
			}*/) {
				// dispatch(placeMarble({
				// 	gameName,
				// 	position,
				// }));
			},

			onChangeUserProfile(/*{
				userID,
				updates,
			}*/) {
			// 	dispatch(changeUserProfile({
			// 		userID,
			// 		updates,
			// 	}));
			},

			onCancelJoin() {
				dispatch(goBack());
			},
		};
	}
);

const withSaga = injectSaga({ key: "PlayGameContainer", saga });

const PlayGameContainer = compose(
	withRedux,
	withSaga
)(PlayGame);

PlayGameContainer.displayName = "PlayGameContainer";

export default PlayGameContainer;
