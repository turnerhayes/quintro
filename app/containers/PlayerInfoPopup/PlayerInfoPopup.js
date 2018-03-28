import PlayerInfoPopup from "@app/components/PlayerInfoPopup";
import { compose } from "redux";
import { connect } from "react-redux";
import selectors   from "@app/selectors";
import {
	changeUserProfile,
}                  from "@app/actions";

const displayName = "PlayerInfoPopupContainer";

const withRedux = connect(
	function mapStateToProps(state, ownProps) {
		const { game, player } = ownProps;

		const playerUser = game && selectors.games.getPlayerUser(
			state,
			{
				player,
				gameName: game.get("name"),
			}
		);

		return {
			playerUser,
		};
	},

	function mapDispatchToProps(dispatch) {
		return {
			onDisplayNameChange({ player, displayName }) {
				dispatch(changeUserProfile({
					userID: player.get("userID"),
					updates: {
						displayName,
					},
				}));
			},
		};
	}
);


const PlayerInfoPopupContainer = compose(
	withRedux
)(PlayerInfoPopup);

PlayerInfoPopupContainer.displayName = displayName;

export default PlayerInfoPopupContainer;
