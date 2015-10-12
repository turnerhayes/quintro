import assert            from "assert";
import Backbone          from "backbone";
import _                 from "lodash";
import Q                 from "q";
import BoardModel        from "./board";
import PlayersCollection from "../collections/players";
import SocketClient      from "../socket-client";

class GameModel extends Backbone.Model {
	get idAttribute() {
		return 'short_id';
	}

	get url() {
		return "/game/" + this.get("short_id");
	}

	get defaults() {
		return {
			currentPlayer: null,
			players: new PlayersCollection()
		};
	}

	initialize() {
		var model = this;

		super.initialize.apply(model, arguments);

		model.set('players', new PlayersCollection(model.get('players')));

		model.set(
			'board',
			new BoardModel(
				_.extend({game: model}, model.get('board'))
			)
		);

		model._attachEventListeners();
	}

	addPlayer(player) {
		var model = this;
		var index;

		assert(player, "called addPlayer without player information");

		index = player.order && player.order < model.get('players').length ?
			player.order :
			undefined;

		model.get('players').add(
			{
				user: player.user,
				color: player.color,
				is_self: player.is_self
			},
			{
				at: index
			}
		);
	}

	join() {
		var model = this;

		var deferred = Q.defer();

		SocketClient.emit('game:join', model.get('short_id'), function(data) {
			if (data.error) {
				deferred.reject(data.message);
				return;
			}

			model.addPlayer(
				_.extend(data, { is_self: true })
			);

			deferred.resolve(model);
		});

		return deferred.promise;
	}

	_attachEventListeners() {
		var model = this;

		SocketClient.on('game:player-joined', function(data) {
			model.addPlayer(data);
		});

		SocketClient.on('game:updated', function(data) {
			model._handleUpdate(data);
		});

		model.listenTo(model.get('players'), 'add', function(addedModel, collection, options) {
			model.trigger('player-added', {
				addedModel,
				index: options.at
			});
		});
	}

	_handleUpdate(data) {
		var model = this;

		if (_.size(data.changed.structure) > 0) {
			model.get('board').addMarbles(
				_.map(
					data.changed.structure,
					function(cellData) {
						return {
							position: [cellData.column, cellData.row],
							color: cellData.color
						};
					}
				)
			);
		}

		if ("current_player" in data.changed) {
			model.set("current_player", data.changed.current_player);
		}
	}
}

export default GameModel;
