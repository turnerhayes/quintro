import assert from "assert";
import _ from "lodash";
import $ from "jquery";
import Backbone from "backbone";
import BoardView from "./board";
import TurnIndicatorView from "./turn-indicator";
import GameModel from '../models/game';
import boardTemplate from "../../templates/partials/board.hbs";

import Handlebars from "handlebars";

class GameView extends Backbone.View {
	initialize(options) {
		var view = this;

		options = options || {};

		assert(options.$boardEl, "Need to specify $boardEl in options");
		
		assert(options.$turnIndicatorEl, "Need to specify $turnIndicatorEl in options");

		assert(!_.isUndefined(options.players), "Need to specify number of players in `players` property of options");

		assert(options.players >= 3 && options.players <= 6, "Number of players must be between 3 and 6 (inclusive)");

		view.model = new GameModel({
			numberOfPlayers: options.players,
		});

		view.boardView = new BoardView({
			el: options.$boardEl.get(0)
		});

		view.turnIndicatorView = new TurnIndicatorView({
			el: options.$turnIndicatorEl.get(0),
			numberOfPlayers: options.players,
		})

		view._attachEventListeners();
	}

	render() {
		var view = this;

		view._detachEventListeners();

		console.log(Handlebars);

		var $boardHtml = $(
			boardTemplate({
				width: view.boardView.model.get('width'),
				height: view.boardView.model.get('height'),
			})
		);

		view.boardView.$el.replaceWith($boardHtml);

		view.boardView = new BoardView($boardHtml).render();

		view._attachEventListeners();
	}

	_attachEventListeners() {
		var view = this;

		view.listenTo(view.boardView.model, 'marble-placed', function() {
			view.model.trigger('marble-placed');
		});

		view.listenTo(view.model, 'player-changed', function(data) {
			view.boardView.color = view.model.get('currentPlayer');
			view.turnIndicatorView.setActivePlayer(view.boardView.color);
		});
	}

	_detachEventListeners() {
	}
}

export default GameView;
