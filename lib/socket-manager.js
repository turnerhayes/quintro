"use strict";

var IOServer  = require('socket.io');
var _         = require('lodash');
var Q         = require('q');
var log4js    = require('log4js');
var assert    = require('assert');
var passport  = require('passport');
var GameStore = require('./persistence/stores/game');
var UserStore = require('./persistence/stores/user');
var GameModel = require('./persistence/models/game');
var UserModel = require('./persistence/models/user');
var config    = require('../lib/utils/config-manager');
var session   = require('../session');

var socketLog = log4js.getLogger('socket');
var gamesLog  = log4js.getLogger('games');

var LOG_LEVELS = {
	INFO: 'info',
	DEBUG: 'debug',
	ERROR: 'error'
};

function _logGameEvent(short_id, message, level) {
	level = level || 'info';

	assert(_.contains(LOG_LEVELS, level), '"' + level + '" is not a valid log level');

	gamesLog[level]('<' + short_id + '>: ' + message);
}

function _findPlayer(user, player) {
	return !_.isUndefined(user) && _(player.user._id).toString() === _(user._id).toString();
}

function _getPlayerColor(game, user) {
	return _.get(
		_.find(
			game.players,
			_.bind(_findPlayer, undefined, user)
		),
		'color'
	);
}

function _resolvePlayerJoinData(args) {
	var socket   = args.socket;
	var short_id = args.short_id;

	socket.request.session.games = socket.request.session.games || {};
	socket.request.session.games[short_id] = socket.request.session.games[short_id] || {};


	return GameStore.getGame({
		short_id: short_id
	}).then(
		function(game) {
			var user = socket.request.user ||
				_.find(game.players, {'sessionId': socket.request.session.id});

			if (!_.isUndefined(user)) {
				return {
					user: user,
					game: game
				};
			}

			return UserStore.addUser(
				new UserModel({
					sessionId: socket.request.session.id
				})
			).then(function(user) {
				return {
					user: user,
					game: game
				};
			});
		}
	).then(
		function(data) {
			var deferred = Q.defer();

			if (_.isUndefined(socket.request.user)) {
				socket.request.logIn(data.user, function(err) {
					if (err) {
						deferred.reject(err);
						return;
					}

					deferred.resolve();
				});
			}
			else {
				deferred.resolve();
			}

			return deferred.promise.then(
				function() {
					return data;
				}
			);
		}
	).then(
		function(data) {
			if (
				!_.isUndefined(socket.request.session.games[short_id].color) &&
				!_.isUndefined(socket.request.session.games[short_id].order)
			) {
				return _.extend(data, {
					color: socket.request.session.games[short_id].color,
					order: socket.request.session.games[short_id].order,
				});
			}

			return data;
		}
	).then(
		function(data) {
			var playerColor;
			var is_current;

			if (_.isUndefined(data.color)) {
				playerColor = _getPlayerColor(data.game, data.user);

				if (!_.isUndefined(playerColor)) {
					return _.extend(data, {
						color: playerColor,
						order: _.findIndex(
							data.game.players,
							_.bind(_findPlayer, undefined, data.user)
						)
					});
				}

				playerColor = _.find(
					GameModel.COLORS,
					function(color) {
						return !_.contains(
							_.pluck(data.game.players, 'color'),
							color
						);
					}
				);

				if (
					_.isUndefined(
						_.find(data.game.players, {_id: data.user._id})
					)
				) {
					data.game.players.push({
						user: data.user,
						color: playerColor,
					});
				}

				if (_.isUndefined(data.game.current_player)) {
					data.game.current_player_color = playerColor;
				}

				is_current = data.game.current_player.color === playerColor;

				return Q(
					GameStore.saveGameState(data.game)
				).then(
					function(game) {
						var index = _.findIndex(
							game.players,
							_.bind(_findPlayer, undefined, data.user)
						);

						return _.extend(data, {
							game: game,
							color: playerColor,
							order: index,
							is_current: is_current,
						});
					}
				);
			}
			else {
				data.is_current = data.game.current_player.color === playerColor;

				return data;
			}
		}
	);
}

var SocketManager = Object.create(Object.prototype, {
	initialize: {
		enumerable: true,
		value: function(options) {
			var webOrigin;
			options = options || {};

			assert(options.server, "server object is missing");

			SocketManager._server = new IOServer(options.server);

			if (!config.websockets.inline) {
				webOrigin = 'http' + (config.app.address.isSecure ? 's' : '') + '://' +
					config.app.address.host;

				if (config.app.address.externalPort) {
					webOrigin += ':' + config.app.address.externalPort;
				}

				SocketManager._server.origins(webOrigin);
			}


			SocketManager._server.use(
				function(socket, next) {
					session.instance(socket.request, socket.request.res, next);
				}
			);

			SocketManager._server.use(
				function(socket, next) {
					passport.initialize()(socket.request, socket.request.res, next);
				}
			);

			SocketManager._server.use(
				function(socket, next) {
					passport.session()(socket.request, socket.request.res, next);
				}
			);

			SocketManager._server.on('connection', SocketManager._onConnect);
		}
	},

	_onConnect: {
		value: function(socket) {
			socketLog.info(
				'socket connected: ' +
				JSON.stringify({
					id: socket.id,
					sessionID: socket.request.sessionID,
					remoteAddress: socket.client.conn.remoteAddress
				})
			);

			socket.on('game:get-state', function(data, fn) {
				SocketManager._onGetGameState(this, data, fn);
			});

			socket.on('board:place-marble', function(data, fn) {
				SocketManager._onPlaceMarble(this, data, fn);
			});

			socket.on('game:join', function(short_id, fn) {
				SocketManager._onJoinGame(this, short_id, fn);
			});
		},
	},

	_onJoinGame: {
		enumerable: true,
		value: function(socket, short_id, fn) {
			if (!short_id) {
				return;
			}

			_resolvePlayerJoinData({
				socket  : socket,
				short_id: short_id
			}).then(
				function(data) {
					if (_.isUndefined(data.color)) {
						_logGameEvent(short_id, 'Color not found for player');
						throw new Error('Color is undefined');
					}

					socket.request.session.games[short_id].color = data.color;
					socket.request.session.games[short_id].order = data.order;
					socket.request.session.save();

					return data;
				}
			).done(
				function(data) {
					socket.join(short_id);

					_logGameEvent(short_id, 'Player ' + data.color + ' joined');

					var playerData = _.extend(data, {
						user: data.user.toFrontendObject(),
						is_current: data.is_current,
					});

					socket.broadcast.to(short_id).emit(
						'game:player-joined',
						playerData
					);

					fn(playerData);
				},
				function(err) {
					_logGameEvent(
						short_id,
						'Player failed to join game: ' + err.message,
						LOG_LEVELS.ERROR
					);
					fn({
						error: true,
						message: err.message,
					});
				}
			);
		}
	},

	_onGetGameState: {
		value: function(socket, short_id, fn) {
			GameStore.getGame({
				short_id: short_id,
			}).done(
				function(game) {
					fn({
						game: _.result(game, 'toFrontendObject'),
					});
				},
				function(err) {
					fn({
						error: true,
						message: err.message,
					});
				}
			);
		}
	},

	_onPlaceMarble: {
		enumerable: true,
		value: function(socket, options, fn) {
			options = options || {};


			var color = socket.request.session.games[options.short_id].color;

			GameStore.getGame({
				short_id: options.short_id,
			}).then(
				function(game) {
					assert(!game.is_over, 'Game is over');
					assert(options.short_id, 'Property "short_id" is required');
					assert(options.position, 'Property "position" is required');

					var column = options.position[0];
					var row = options.position[1];

					if (color !== game.current_player.color) {
						throw new Error('Not ' + color + "'s turn");
					}

					if (
						game.cellIsFilled({
							row: row,
							column: column
						})
					) {
						throw new Error('Position ' + JSON.stringify(options.position) +
								' is already occupied by color ' +
								game.getCell(column, row));
					}

					var result = game.fillCell({
						position: [column, row],
						color   : color,
					});

					if (result.quintros) {
						game.winner = color;
					}
					else {
						game.nextPlayer();
					}

					return GameStore.saveGameState(game).then(
						function(game) {
							var data = {
								game: game,
								row: row,
								column: column,
								color: color,
							};

							if (result.quintros) {
								data.quintros = result.quintros;
							}

							return data;
						}
					);
				}
			).done(
				function(data) {
					_logGameEvent(
						data.game.short_id,
						'Player ' + data.color + ' placed a marble at [' +
							data.row + ', ' + data.column + ']'
					);

					var eventData = {
						game: data.game.toFrontendObject(),
						changed: {
							structure: [
								{
									row: data.row,
									column: data.column,
									color: data.color,
								}
							]
						}
					};

					if (!data.game.is_over) {
						eventData.changed.current_player = data.game.current_player;
					}

					SocketManager._server.to(data.game.short_id).emit('game:updated', eventData);

					if (data.game.is_over) {
						SocketManager._server.to(data.game.short_id).emit('game:over', {
							player: data.game.current_player,
							quintros: data.quintros
						});
					}
				},
				function(err) {
					var validationErrors = '';

					if (err.name === 'ValidationError') {
						validationErrors = 'Validation errors:\n' +
							_.map(
								err.errors,
								function(error) {
									return error.path + ': ' + error.message;
								}
							).join('\n\n');
					}

					_logGameEvent(
						options.short_id,
						'Error placing a marble by player ' + color + ' at position ' +
							JSON.stringify(options.position) + ': ' + err.message + "\n" +
							validationErrors + '\n' +
							err.stack,
						LOG_LEVELS.ERROR
					);

					fn({
						error: true,
						message: err.message,
					});
				}
			);
		}
	},
});

exports = module.exports = SocketManager;
