import assert            from "assert";
import Backbone          from "backbone";
import _                 from "lodash";
import Q                 from "q";
import BoardModel        from "./board";
import PlayersCollection from "../collections/players";
import PlayerModel       from "../models/player";
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
			players: new PlayersCollection()
		};
	}

	initialize() {
		var model = this;

		super.initialize.apply(model, arguments);

		model.set('players', new PlayersCollection(model.get('players')));

		if (model.get('current_player')) {
			model.set('current_player',
				model.get('players').find(
					function(player) {
						return model.get('current_player').user.id === player.get('user').get('id');
					}
				) || new PlayerModel(model.get('current_player'))
			);
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
				is_self: player.is_self
			},
			{
				at: index
			}
		);

		if (player.is_current) {
			model.set('current_player', playerModel);
		}
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
