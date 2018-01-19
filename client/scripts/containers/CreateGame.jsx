import CreateGame  from "project/scripts/components/CreateGame";
import { connect } from "react-redux";
import {
	createGame
}                     from "project/scripts/redux/actions";

const CreateGameContainer = connect(
	null,
	function mapDispatchToProps(dispatch) {
		return {
			onCreateGame(gameData) {
				dispatch(createGame(gameData));
			},
		};
	}
)(CreateGame);

CreateGameContainer.displayName = "CreateGameContainer";

export default CreateGameContainer;
