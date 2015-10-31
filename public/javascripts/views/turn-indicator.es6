import Backbone           from "backbone";
import $                  from "jquery";
import GameApp            from "../apps/game";
import PlayerItemTemplate from "../../templates/partials/player-turn-item.hbs";

class TurnIndicatorView extends Backbone.View {
	initialize() {
		var view = this;

		view._getGamePromise = GameApp.getCurrentGame().then(
			function(game) {
				view.model = game;
			}
		);
	}

	render() {
		var view = this;

		view._getGamePromise.done(
			function() {
				view._attachEventListeners();

				view._setActiveColor();
			}
		);

		return view;
	}

	_setActiveColor() {
		var view = this;

		if (!view.model.get('current_player')) {
			return;
		}

		view.$el.find('.player').removeClass('active')
			.filter('.' + view.model.get('current_player').get('color'))
			.addClass('active');
	}

	_getPlayerEl(player) {
		return $('<div></div>').addClass('player ' + player)
			.attr('data-player', player);
	}

	_attachEventListeners() {
		var view = this;

		view.listenTo(view.model.get('players'), 'add', function(addedModel, collection, options) {
			view._addPlayer(addedModel, options.at);

			view._setActiveColor();
		});

		view.listenTo(view.model, 'change:current_player', function() {
			view._setActiveColor();
		});
	}

	_addPlayer(player, order) {
		var view = this;

		if (view.$('.player.' + player.get('color')).length > 0) {
			return;
		}

		var $playerElAtIndex = view.$('.player').eq(order);
		var playerItemHTML = PlayerItemTemplate(player.toJSON());

		if ($playerElAtIndex.length > 0 && !$playerElAtIndex.hasClass(player.get('color'))) {
			$playerElAtIndex.before(playerItemHTML);
		}
		else {
			view.$('ul').append(playerItemHTML);
		}
	}
}

export default TurnIndicatorView;
