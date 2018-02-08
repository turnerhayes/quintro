import FindGame    from "@app/components/FindGame";
import { compose } from "redux";
import { connect } from "react-redux";
import { push }    from "react-router-redux";
import injectSaga  from "@app/utils/injectSaga";
import saga        from "./saga";
import {
	findOpenGames
}                  from "@app/actions";

const withConnect = connect(
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
);

const withSaga = injectSaga({ key: "FindGame", saga });

const FindGameContainer = compose(
	withConnect,
	withSaga
)(FindGame);

FindGameContainer.displayName = "FindGameContainer";

export default FindGameContainer;
