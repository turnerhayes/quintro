import Backbone          from "backbone";
import GameApp           from '../apps/game';

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
