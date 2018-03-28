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
}                  from "@app/actions";
import selectors from "@app/selectors";
import saga        from "./saga";

const displayName = "PlayGameContainer";

const withRedux = connect(
	function mapStateToProps(state, ownProps) {
		const selectorProps = { gameName: ownProps.gameName };
		const game = selectors.games.getGame(state, selectorProps);
		const gameIsLoaded = selectors.games.isLoaded(state, selectorProps);
		const currentUserPlayer = selectors.games.getCurrentUserPlayer(state, selectorProps);

		const props = {
			playerUsers: selectors.games.getPlayerUsers(state, selectorProps),

			isInGame: selectors.games.isInGame(state, selectorProps),

			isWatchingGame: selectors.games.isWatchingGame(state, selectorProps),

			watcherCount: selectors.games.getWatcherCount(state, selectorProps),

			hasJoinedGame: selectors.games.hasJoinedGame(state, selectorProps),

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

			onPlaceMarble({
				gameName,
				position,
			}) {
				dispatch(placeMarble({
					gameName,
					position,
				}));
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
