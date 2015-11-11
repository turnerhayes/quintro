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
			current_player: null,
			players: new PlayersCollection(),
			own_color: null,
			is_over: false,
			winner: null,
			winning_quintros: null
		};
	}

	initialize() {
		var model = this;

		super.initialize.apply(model, arguments);

		model.set('players', new PlayersCollection(model.get('players')));

		if (_.isObject(model.get('current_player'))) {
			model.set('current_player', model._findOrAddPlayer(model.get('current_player')));
		}

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

		var playerModel = model.get('players').add(
			{
				user: player.user,
				color: player.color,
				is_self: player.is_self,
				is_current: player.is_current,
				is_present: player.is_present
			},
			{
				at: index
			}
		);

		if (player.is_current) {
			model.set('current_player', playerModel);
		}

		if (player.is_self) {
			model.set('own_color', player.color);
		}
	}

	join() {
		var model = this;

		var deferred = Q.defer();

		SocketClient.emit('game:join', model.get('short_id'), function(data) {
			var err;

			if (data.error) {
				err = new Error(data.message);
				err.code = data.code;
				deferred.reject(err);
				return;
			}

			model.addPlayer(
				_.extend(
					data,
					{
						is_self: true,
						is_present: true
					}
				)
			);

			deferred.resolve(model);
		});

		return deferred.promise;
	}

	refreshPlayerPresences() {
		var model = this;

		SocketClient.emit('game:get-player-presence', model.get('short_id'), 
			function(players) {
				var gamePlayers = _.map(players, _.bind(model._findOrAddPlayer, model));

				model.get('players').each(
					function(player) {
						// Self player can be assumed to be present.
						if (!player.get('is_self')) {
							player.set('is_present', _.contains(gamePlayers, player));
						}
					}
				);
			}
		);
	}

	toJSON() {
		var model = this;

		var json = super.toJSON.apply(model, arguments);

		json.players = model.get('players').map(
			function(player) {
				return player.toJSON();
			}
		);

		json.current_player = model.get('current_player') ?
			model.get('current_player').toJSON() :
			undefined;

		json.board = model.get('board').toJSON();

		return json;
	}

	_attachEventListeners() {
		var model = this;

		SocketClient.on('game:player-joined', function(player) {
			player.is_present = true;

			model.addPlayer(player);
		});

		SocketClient.on('game:player-left', function(data) {
			model._findOrAddPlayer(data.player).set('is_present', false);
		});

		SocketClient.on('game:updated', function(data) {
			model._handleUpdate(data);
		});

		SocketClient.on('game:over', function(data) {
			model._handleGameOver(data);
		});

		SocketClient.on('connection:restored', function() {
			model.refreshPlayerPresences();
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
			model.set("current_player", model._findOrAddPlayer(data.changed.current_player));
		}
	}

	_handleGameOver(data) {
		var model = this;

		model.set({
			is_over: true,
			winner: model._findOrAddPlayer(data.player),
			winning_quintros: data.quintros
		});
	}

	_findOrAddPlayer(playerToFind) {
		var model = this;

		return model.get('players').find(
			function(player) {
				return playerToFind.user.id === player.get('user').get('id');
			}
		) || model.get('players').add(playerToFind);
	}
}

export default GameModel;
