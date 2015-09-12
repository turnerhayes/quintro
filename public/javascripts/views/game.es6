import assert from "assert";
import _ from "lodash";
import $ from "jquery";
import Backbone from "backbone";
import Handlebars from "handlebars";
import BoardView from "./board";
import TurnIndicatorView from "./turn-indicator";
import GameModel from '../models/game';
import BoardModel from '../models/board';
import boardTemplate from "../../templates/partials/board.hbs";
import SocketClient from "../socket-client";

class GameView extends Backbone.View {
	initialize(options) {
		var view = this;

		options = options || {};

		assert(options.$boardEl, "Need to specify $boardEl in options");
		
		assert(options.$turnIndicatorEl, "Need to specify $turnIndicatorEl in options");

		view.short_id = options.short_id || view.$('[name="game-id"]').val();

		var serializedGameModel = view.$('[name="game-model"]').val();

		if (serializedGameModel) {
			serializedGameModel = JSON.parse(serializedGameModel);
		}

		view.model = new GameModel(
			serializedGameModel ||
			{
				numberOfPlayers: options.players,
			}
		);

		view.boardView = new BoardView({
			el: options.$boardEl.get(0),
			model: (
				serializedGameModel ?
				new BoardModel(serializedGameModel.board) :
				undefined
			),
		});

		view.turnIndicatorView = new TurnIndicatorView({
			el: options.$turnIndicatorEl.get(0),
			players: view.model.get('players'),
		});
		
		view.boardView.color = view.model.get('current_player');

		SocketClient.emit('game:join', view.model.get('short_id'));

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

		SocketClient.on('game:updated', function(data) {
			console.log('game:updated: ', data);
			view._synchronize(data);
		});

		view.listenTo(view.boardView.model, 'marble-placed', function(data) {
			view.model.trigger('marble-placed', data);

			if (!_.isUndefined(view.model.get('short_id'))) {
				SocketClient.emit('board:marble-placed', {
					short_id: view.short_id,
					player: data.color,
					position: data.position,
				});
			}
		});

		view.listenTo(view.boardView.model, 'quintro', function(data) {
			view.endGame({
				winner: data.color
			});
		});

		view.listenTo(view.model, 'player-changed', function(data) {
			view.boardView.color = view.model.get('current_player');
			view.turnIndicatorView.setActivePlayer(view.boardView.color);
		});
	}

	_detachEventListeners() {
	}

	_synchronize(trueState) {
		var view = this;

		view.boardView.update(trueState.game.board);
		view.boardView.color = trueState.game.current_player;
		view.turnIndicatorView.setActivePlayer(trueState.game.current_player);
	}

	endGame() {
		var view = this;

		view.$el.addClass('game-over');
	}
}

export default GameView;
