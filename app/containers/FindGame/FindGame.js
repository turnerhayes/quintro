import FindGame    from "@app/components/FindGame";
import { compose } from "redux";
import { connect } from "react-redux";
import { push }    from "react-router-redux";
import injectSaga  from "@app/utils/injectSaga";
import {
	findOpenGames,
}                  from "@app/actions";
import selectors   from "@app/selectors";

import saga        from "./saga";

const withConnect = connect(
	function mapStateToProps(state) {
		const findGameError = state.get("games").get("findGameError");

		return {
			findGameError,
			results: selectors.games.getOpenGames(state),
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

			onCancelFind() {

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
