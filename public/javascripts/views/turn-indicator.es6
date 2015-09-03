import Backbone from "backbone";

class TurnIndicatorView extends Backbone.View {
	initialize(options) {
		var view = this;

		options = options || {};

		view.$playerItems = view.$el.find('.player');

		view.$playerItems.first().addClass('active');

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
}

export default TurnIndicatorView;
