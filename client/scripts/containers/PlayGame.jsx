import PlayGame    from "project/scripts/components/PlayGame";
import { connect } from "react-redux";
import { goBack }  from "react-router-redux";
import {
	getGame,
	getUsers,
	placeMarble,
	changeUserProfile
}                  from "project/scripts/redux/actions";
import {
	playerSelector
}                  from "project/scripts/redux/selectors";

const PlayGameContainer = connect(
	function mapStateToProps(state, ownProps) {
		const games = state.get("games");

		const game = games && games.items.get(ownProps.gameName);

		const props = {
			players: playerSelector(state, {
				...ownProps,
				players: game && game.players
			})
		};

		if (games.getGameError) {
			props.getGameError = games.getGameError;
		}
		else {
			props.game = game;
		}

		return props;
	},

	function mapDispatchToProps(dispatch) {
		return {
			onGetGame({ gameName }) {
				dispatch(getGame({ gameName }));
			},

			onGetUsers({ userIDs }) {
				dispatch(getUsers({ userIDs }));
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

			onChangeUserProfile({
				userID,
				updates,
			}) {
				dispatch(changeUserProfile({
					userID,
					updates,
				}));
			},

			onCancelJoin() {
				dispatch(goBack());
			},
		};
	}
)(PlayGame);

PlayGameContainer.displayName = "PlayGameContainer";

export default PlayGameContainer;
