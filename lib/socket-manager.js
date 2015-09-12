"use strict";

var IOServer         = require('socket.io');
var _                = require('lodash');
var log              = require('log4js').getLogger('socket');
var SocketSession    = require('socket.io-express-session');
var PassportSocketIO = require('passport.socketio');
var assert           = require('assert');
var GameModel        = require('./persistence/models/game');
var GameStore        = require('./persistence/stores/game');
var appConfig        = require('../config/app');

var SocketManager = Object.create(Object.prototype, {
	initialize: {
		enumerable: true,
		value: function(options) {
			options = options || {};

			assert(options.server, "server object is missing");
			assert(options.session, "session object is missing");
			assert(options.sessionStore, "sessionStore object is missing");

			SocketManager._server = new IOServer(options.server);

			SocketManager._server.use(SocketSession(options.session));

			// TODO: Make PassportSocketIO work
			/*SocketManager._server.use(PassportSocketIO.authorize({
				key:    appConfig.session.key,
				secret: appConfig.appSecret,
				store:  options.sessionStore,
				passport: require('passport'),
				success: function(data, accept) {
					log.info('connected to PassportSocketIO');

					accept(null, true);
				},
				fail: function(socket, message, error, accept) {
					if (message) {
						log.error((error ? 'Fatal' : 'Nonfatal') + ' error connecting to PassportSocketIO: ', message);
					}

					if (error) {
						throw new Error(error);
					}

					accept();
				}
			}));*/

			SocketManager._server.on('connection', SocketManager._onConnect);
		}
	},

	_onJoinGame: {
		enumerable: true,
		value: function(socket, short_id) {
			console.log('joined game ', short_id);
			socket.join(short_id);
		}
	},

	_onConnect: {
		value: function(socket) {
			log.info(
				'connected: ' +
				JSON.stringify({
					id: socket.id,
					sessionID: socket.handshake.sessionID,
					remoteAddress: socket.client.conn.remoteAddress
				})
			);

			socket.on('message', function(data) {
				console.log('message: ', data);
			});

			socket.on('game:create', function(data) {
				SocketManager._onCreateGame(this, data);
			});

			socket.on('game:save-state', function(data) {
				SocketManager._onSaveGameState(this, data);
			});

			socket.on('game:get-state', function(data) {
				SocketManager._onGetGameState(this, data);
			});

			socket.on('board:marble-placed', function(data) {
				SocketManager._onMarblePlaced(this, data);
			});

			socket.on('game:join', function(short_id) {
				SocketManager._onJoinGame(this, short_id);
			});
		},
	},

	_onSaveGameState: {
		value: function(socket, data) {
			log.info(socket.id +' - game:save-state');
			
			var gameModel = new GameModel(game);

			return GameStore.saveGameState(data).done(
				function() {
					socket.emit('game:state-saved', {
						success: true
					});
				},
				function(err) {
					socket.emit('game:state-saved', {
						success: false,
						error: err
					});
				}
			);
		}
	},

	_onGetGameState: {
		value: function(socket, short_id) {
			GameStore.getGame({
				short_id: short_id,
			}).done(
				function(game) {
					if (game) {
						socket.emit('game:state', {
							game: game.toObject()
						});
					}
				}
			);
		}
	},

	_onMarblePlaced: {
		enumerable: true,
		value: function(socket, options) {
			options = options || {};

			if (_.isUndefined(options.short_id)) {
				socket.emit('marble-placement-error', {
					message: 'Property "short_id" is required',
				});
				return;
			}

			if (_.isUndefined(options.player)) {
				socket.emit('marble-placement-error', {
					message: 'Property "player" is required',
				});
				return;
			}

			if (_.isUndefined(options.position)) {
				socket.emit('marble-placement-error', {
					message: 'Property "player" is required',
				});
				return;
			}


			GameStore.getGame({
				short_id: options.short_id,
			}).then(
				function(game) {
					var column = options.position[0];
					var row = options.position[1];

					if (!_.isNull(game.board.structure[row][column])) {
						socket.emit('marble-placement-error', {
							message: 'Position ' + JSON.stringify(options.position) +
								' is already occupied by player ' +
								game.board.structure[row][column]
						});
						return;
					}

					game.board.structure[row][column] = options.player;
					game.markModified('board.structure');

					game.nextPlayer();

					return GameStore.saveGameState(game).then(
						function(game) {
							return {
								game: game,
								row: row,
								column: column,
								player: options.player,
							};
						}
					);
				}
			).done(
				function(data) {
					SocketManager._server.to(data.game.short_id).emit('game:updated', {
						game: data.game.toObject(),
						changed: {
							structure: [
								{
									row: data.row,
									column: data.column,
									player: data.player,
								}
							],
							current_player: data.game.current_player
						}
					});
				},
				function(err) {
					console.error('error saving game state: ', err);
					socket.emit('game:update-failed', {
						message: err.message
					});
				}
			);
		}
	},

	_onCreateGame: {
		enumerable: true,
		value: function(socket, data) {
			GameStore.createGame({
				short_id: data.short_id,
				width: data.width,
				height: data.height,
			}).done(
				function(game) {
					socket.join(game.short_id);
					socket.emit('game:created', game.toObject());
				},
				function(err) {
					console.err('failed to create game: ', err);
					socket.emit('game:create-failed', err);
				}
			);
		}
	}
});

exports = module.exports = SocketManager;
