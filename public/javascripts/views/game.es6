import _                            from "lodash";
import $                            from "jquery";
import Backbone                     from "backbone";
import GameApp                      from '../apps/game';
import SocketClient                 from "../socket-client";
import ConnectionLostDialogTemplate from "../../templates/modals/connection-lost.hbs";
import GameFullDialogTemplate       from "../../templates/modals/game-full.hbs";
import ErrorCodes                   from "../../../shared/error-codes";

class GameView extends Backbone.View {
	initialize(options) {
		var view = this;

		options = options || {};

		view._getGamePromise = GameApp.getCurrentGame().then(
			function(game) {
				view.model = game;

				return view.model.join();
			}
		).then(
			undefined,
			function(err) {
				if (err.code === ErrorCodes.GAME_FULL) {
					view._handleGameFull();
					return;
				}

				throw err;
			}
		);
	}

	render() {
		var view = this;

		view._getGamePromise.done(
			function() {
				view._setYourTurn();
				view._attachEventListeners();
				view.model.refreshPlayerPresences();
			}
		);
	}

	_attachEventListeners() {
		var view = this;

		view.listenTo(view.model, 'change:current_player', function() {
			view._setYourTurn();
		});

		view.listenTo(view.model, 'change:is_over', function() {
			view.endGame();
		});

		view.listenTo(SocketClient, 'connection:closed', function() {
			view._handleConnectionLost();
		});

		view.listenTo(SocketClient, 'connection:restored', function() {
			view._handleConnectionRestored();
		});
	}

	_setYourTurn() {
		var view = this;

		view.$el.toggleClass(
			'your-turn',
			view.model.get('current_player') &&
			view.model.get('current_player').get('is_self')
		);
	}

	_handleConnectionLost() {
		var view = this;

		if (!view._$connectionLostModal) {
			view._$connectionLostModal = $(ConnectionLostDialogTemplate());
			view._$connectionLostModal.modal({
				show: false,
				keyboard: false,
				backdrop: 'static'
			});
		}

		view._$connectionLostModal.modal('show');
	}

	_handleConnectionRestored() {
		var view = this;

		if (view._$connectionLostModal) {
			view._$connectionLostModal.modal('hide');
		}
	}

	_handleGameFull() {
		var view = this;

		if (!view._$gameFullModal) {
			view._$gameFullModal = $(GameFullDialogTemplate());
			view._$gameFullModal.modal({
				show: false,
				keyboard: false,
				backdrop: 'static'
			});
		}

		view._$gameFullModal.modal('show');
	}

	endGame() {
		var view = this;

		view.$el.attr('data-winning-color', _.capitalize(view.model.get('winner').get('color')))
			.addClass('game-over');
	}
}

export default GameView;
