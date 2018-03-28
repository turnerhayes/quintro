import PropTypes   from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import Board       from "@app/components/Board";
import selectors   from "@app/selectors";

const displayName = "BoardContainer";

const withRedux = connect(
	function mapStateToProps(state, ownProps) {
		const selectorProps = { gameName: ownProps.gameName };
		const game = selectors.games.getGame(state, selectorProps);
		const gameIsOver = selectors.games.isOver(state, selectorProps);
		const quintros = gameIsOver ?
			selectors.games.getQuintros(state, selectorProps) :
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
