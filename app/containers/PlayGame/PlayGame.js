import PlayGame    from "@app/components/PlayGame";
import { compose } from "redux";
import { connect } from "react-redux";
import { goBack }  from "connected-react-router";
import injectSaga  from "@app/utils/injectSaga";
import {
	getGame,
	joinGame,
	watchGame,
	startGame,
	placeMarble,
	setUIState,
}                  from "@app/actions";
import selectors   from "@app/selectors";
import saga        from "./saga";

const displayName = "PlayGameContainer";

const uiSection = "PlayGame";

const zoomLevelSettingName = "currentZoomLevel";

const withRedux = connect(
	function mapStateToProps(state, ownProps) {
		const selectorProps = { gameName: ownProps.gameName };
		const game = selectors.games.getGame(state, selectorProps);
		const currentUserPlayers = selectors.games.getCurrentUserPlayers(state, selectorProps);
		const currentZoomLevel = selectors.ui.getSetting(state, {
			section: uiSection,
			settingName: zoomLevelSettingName,
		});

		const props = {
			playerUsers: selectors.games.getPlayerUsers(state, selectorProps),

			isInGame: selectors.games.isInGame(state, selectorProps),

			isWatchingGame: selectors.games.isWatchingGame(state, selectorProps),

			watcherCount: selectors.games.getWatcherCount(state, selectorProps),

			hasJoinedGame: selectors.games.hasJoinedGame(state, selectorProps),

			currentUserPlayers,

			currentPlayerColor: selectors.games.getCurrentPlayerColor(state, selectorProps),

			currentZoomLevel,
			
			game,
		};


		return props;
	},

	function mapDispatchToProps(dispatch, ownProps) {
		return {
			onGetGame() {
				dispatch(getGame({ gameName: ownProps.gameName }));
			},

			onWatchGame() {
				dispatch(watchGame({ gameName: ownProps.gameName }));
			},

			onStartGame() {
				dispatch(startGame({ gameName: ownProps.gameName }));
			},

			onJoinGame({ colors }) {
				if (!colors) {
					dispatch(joinGame({
						gameName: ownProps.gameName,
						colors: undefined,
					}));
					return;
				}

				dispatch(joinGame({
					gameName: ownProps.gameName,
					colors,
				}));
			},

			onPlaceMarble({
				gameName,
				position,
				color,
			}) {
				dispatch(placeMarble({
					gameName,
					position,
					color,
				}));
			},

			onCancelJoin() {
				dispatch(goBack());
			},

			onZoomLevelChange(value) {
				dispatch(setUIState({
					section: uiSection,
					settings: {
						[zoomLevelSettingName]: value,
					},
				}));
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
