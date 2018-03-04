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
	placeMarble,
	// getUsers,
	// changeUserProfile
}                  from "@app/actions";
import {
	games as gameSelectors
}                  from "@app/selectors";
import saga        from "./saga";

const displayName = "PlayGameContainer";

const withRedux = connect(
	function mapStateToProps(state, ownProps) {
		const selectorProps = { gameName: ownProps.gameName };
		const game = gameSelectors.getGame(state, selectorProps);
		const gameIsLoaded = gameSelectors.isLoaded(state, selectorProps);
		const currentUserPlayer = gameSelectors.getCurrentUserPlayer(state, selectorProps);

		const props = {
			playerUsers: gameSelectors.getPlayerUsers(state, selectorProps),

			isInGame: gameSelectors.isInGame(state, selectorProps),

			isWatchingGame: gameSelectors.isWatchingGame(state, selectorProps),

			hasJoinedGame: gameSelectors.hasJoinedGame(state, selectorProps),

			currentUserPlayerColor: currentUserPlayer && currentUserPlayer.get("color"),
		};

		const getGameError = state.getIn([ "games", "getGameError" ]);

		if (getGameError) {
			props.getGameError = getGameError;
		}
		else if (gameIsLoaded) {
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

			onPlaceMarble({
				gameName,
				position,
			}) {
				dispatch(placeMarble({
					gameName,
					position,
				}));
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

const withSaga = injectSaga({ key: displayName, saga });

const PlayGameContainer = compose(
	withRedux,
	withSaga,
)(PlayGame);

PlayGameContainer.displayName = displayName;

export default PlayGameContainer;
