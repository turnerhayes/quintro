import assert            from "assert";
import _                 from "lodash";
import $                 from "jquery";
import Backbone          from "backbone";
import BoardView         from "./board";
import GameApp           from '../apps/game';
import GameModel         from '../models/game';
import BoardModel        from '../models/board';
import boardTemplate     from "../../templates/partials/board.hbs";

class GameView extends Backbone.View {
	initialize(options) {
		var view = this;

		options = options || {};

		view._getGamePromise = GameApp.getCurrentGame().then(
			function(game) {
				view.model = game;

				return view.model.join();
			}
		);
	}

	render() {
		var view = this;

		view._detachEventListeners();

		view._getGamePromise.done(
			function() {
				view._attachEventListeners();
			}
		);
	}

	_attachEventListeners() {
		var view = this;

		view.listenTo(view.model.get('board'), 'quintro', function(data) {
			view.endGame({
				winner: data.color
			});
		});
	}

	_detachEventListeners() {
	}

	endGame() {
		var view = this;

		view.$el.addClass('game-over');
	}
}

export default GameView;
