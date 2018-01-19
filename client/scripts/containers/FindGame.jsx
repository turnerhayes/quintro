import FindGame    from "project/scripts/components/FindGame";
import { connect } from "react-redux";
import { push }    from "react-router-redux";
import {
	findOpenGames
}                  from "project/scripts/redux/actions";

const FindGameContainer = connect(
	function mapStateToProps(state) {
		const { findGameError, findResults } = state.get("games") || {};

		return {
			findGameError,
			results: findResults
		};
	},

	function mapDispatchToProps(dispatch) {
		return {
			onJoinGame({ gameName }) {
				dispatch(push(`/play/${gameName}`));
			},

			onFindOpenGames({ numberOfPlayers }) {
				dispatch(findOpenGames({ numberOfPlayers }));
			},
		};
	}
)(FindGame);

FindGameContainer.displayName = "FindGameContainer";

export default FindGameContainer;
