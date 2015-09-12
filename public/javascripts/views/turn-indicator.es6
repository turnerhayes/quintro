import Backbone from "backbone";
import _ from "lodash";
import $ from "jquery";

class TurnIndicatorView extends Backbone.View {
	initialize(options) {
		var view = this;

		options = options || {};

		if (view.$('.player').length === 0) {
			_.each(
				options.players,
				function(player) {
					view.$el.append(view._getPlayerEl(player));
				}
			);

			view.$('.player').first().addClass('active');
		}

		view.$playerItems = view.$el.find('.player');


		view.$playerItems.each(
			function(index) {
				$(this).toggleClass('hidden', index >= options.numberOfPlayers);
			}
		);
	}

	setActivePlayer(activePlayer) {
		var view = this;

		view.$el.find('.player').removeClass('active')
			.filter('[data-player="' + activePlayer + '"]')
			.addClass('active');
	}

	_getPlayerEl(player) {
		var view = this;

		return $('<div></div>').addClass('player ' + player)
			.attr('data-player', player);
	}
}

export default TurnIndicatorView;
