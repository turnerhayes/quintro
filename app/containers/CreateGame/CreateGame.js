import { compose } from "redux";
import { connect } from "react-redux";
import CreateGame  from "@app/components/CreateGame";
import injectSaga  from "@app/utils/injectSaga";
import {
	createGame,
}                  from "@app/actions";
import saga        from "./saga";

const withRedux = connect(
	null,
	function mapDispatchToProps(dispatch) {
		return {
			onCreateGame({
				width,
				height,
				playerLimit,
			}) {
				dispatch(createGame({
					width,
					height,
					playerLimit,
				}));
			},
		};
	}
);

const withSaga = injectSaga({ key: "CreateGameContainer", saga });

const CreateGameContainer = compose(
	withSaga,
	withRedux,
)(CreateGame);

CreateGameContainer.displayName = "CreateGameContainer";

export default CreateGameContainer;
