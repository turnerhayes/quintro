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
				view._setYourTurn();
				view._attachEventListeners();
			}
		);
	}

	_attachEventListeners() {
		var view = this;

		view.listenTo(view.model, 'change:current_player', function() {
			view._setYourTurn();
		});

		view.listenTo(view.model, 'change:is_over', function() {
			console.log('GAME OVER');

			if (view.model.get('winner') === view.model.get('own_color')) {
				console.log('YOU WON!!');
			}

			view.endGame();
		});
	}

	_detachEventListeners() {
	}

	_setYourTurn() {
		var view = this;

		view.$el.toggleClass('your-turn', view.model.get('current_player').get('is_self'));
	}

	endGame() {
		var view = this;

		view.$el.addClass('game-over');
	}
}

export default GameView;
