import { Map }     from "immutable";
import { compose } from "redux";
import { connect } from "react-redux";
import CreateGame  from "@app/components/CreateGame";
import injectSaga  from "@app/utils/injectSaga";
import injectReducer from "@app/utils/injectReducer";
import {
	createGame,
	checkGameName,
	CHECKED_GAME_NAME,
}                  from "@app/actions";
import saga        from "./saga";

const withRedux = connect(
	function mapStateToProps(state) {
		const isNameValid = state.getIn([ "CreateGameContainer", "isNameValid" ], false);

		return {
			isNameValid,
		};
	},
	function mapDispatchToProps(dispatch) {
		return {
			onCheckName({ name }) {
				dispatch(checkGameName({ name }));
			},

			onCreateGame({
				name,
				width,
				height,
				playerLimit,
			}) {
				dispatch(createGame({
					name,
					width,
					height,
					playerLimit,
				}));
			},
		};
	}
);

const withSaga = injectSaga({ key: "CreateGameContainer", saga });

export const reducer = function CreateGameContainerReducer(state = Map(), action) {
	switch(action.type) {
		case CHECKED_GAME_NAME: {
			return state.set("isNameValid", !action.payload.result);
		}

		default: return state;
	}
};

const withReducer = injectReducer({
	key: "CreateGameContainer",
	reducer, 
});

const CreateGameContainer = compose(
	withSaga,
	withRedux,
	withReducer
)(CreateGame);

CreateGameContainer.displayName = "CreateGameContainer";

export default CreateGameContainer;
