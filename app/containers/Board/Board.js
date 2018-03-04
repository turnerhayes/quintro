import PropTypes   from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import Board       from "@app/components/Board";
import {
	games as gameSelectors
}                  from "@app/selectors";

const displayName = "BoardContainer";

const withRedux = connect(
	function mapStateToProps(state, ownProps) {
		const selectorProps = { gameName: ownProps.gameName };
		const game = gameSelectors.getGame(state, selectorProps);
		const gameIsOver = gameSelectors.isOver(state, selectorProps);
		const quintros = gameIsOver ?
			gameSelectors.getQuintros(state, selectorProps) :
			undefined;

		return {
			board: game.get("board"),
			quintros,
			gameIsOver,
		};
	}
);

const BoardContainer = compose(
	withRedux,
)(Board);

BoardContainer.displayName = displayName;

BoardContainer.propTypes = {
	gameName: PropTypes.string.isRequired,
};

export default BoardContainer;
