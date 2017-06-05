"use strict";

const _            = require("lodash");
const Promise      = require("bluebird");
const path         = require("path");
const assert       = require("assert");
const IOServer     = require("socket.io");
const passport     = require("passport");
const cookieParser = require("cookie-parser");
const rfrProject   = require("rfr")({
	root: path.resolve(__dirname, "..", "..", "..", "..")
});
const GameStore    = rfrProject("server/persistence/stores/game");
// const UserStore  = rfrProject("server/persistence/stores/user");
const GameModel    = rfrProject("server/persistence/models/game");
// const UserModel  = rfrProject("server/persistence/models/user");
const ErrorCodes   = rfrProject("shared-lib/error-codes");
const Config       = rfrProject("server/lib/config");
const Loggers      = rfrProject("server/lib/loggers");
const session      = rfrProject("server/session");

const LOG_LEVELS   = {
	INFO: "info",
	DEBUG: "debug",
	ERROR: "error"
};

function _logGameEvent({ gameName, message, level, stack }) {
	level = level || "info";

	assert(_.includes(LOG_LEVELS, level), `"${level}" is not a valid log level`);

	Loggers.websockets.log(level, `<${gameName}>: ${message}${stack ? "\n" + stack : ""}`);
}

function _findPlayer({user, sessionID}, player) {
	if (!_.isUndefined(user)) {
		return _(player.user._id).toString() === _(user._id).toString();
	}

	return player.sessionID === sessionID;
}

function _getPlayer({game, user, sessionID}) {
	return _.find(
		game.players,
		_.bind(_findPlayer, undefined, {user, sessionID})
	);
}

function _resolvePlayerJoinData({ socket, gameName }) {
	return GameStore.getGame({
		name: gameName
	}).then(
		(game) => {
			let err;
			const user = socket.request.user ||
				_.find(game.players, {sessionId: socket.request.session.id});

			if (!_.isUndefined(user)) {
				return {
					user: user,
					game: game
				};
			}

			// User is not currently a player; make sure there is room
			// for them to join
			if (_.size(game.players) >= game.player_limit) {
				err = new Error("Game is full");
				err.code = ErrorCodes.GAME_FULL;

				throw err;
			}

			if (socket.request.user) {
				return {
					user: socket.request.user,
					game: game
				};
			}

			return {
				sessionID: socket.request.session.id,
				user: user,
				game: game
			};
		}
	).then(
		(data) => {
			return new Promise(
				(resolve, reject) => {
					if (_.isUndefined(socket.request.user) && data.user) {
						socket.request.logIn(data.user, function(err) {
							if (err) {
								reject(err);
								return;
							}

							resolve();
						});
					}
					else {
						resolve();
					}					
				}
			).then(() => data);
		}
	).then(
		(data) => {
			let is_current;
			let playerColor = _.get(_getPlayer(data), "color");

			if (!_.isUndefined(playerColor)) {
				return _.extend(data, {
					color: playerColor,
					order: _.findIndex(
						data.game.players,
						_.bind(_findPlayer, undefined, { user: data.user, sessionID: socket.request.session.id })
					)
				});
			}

			playerColor = _.find(
				GameModel.COLORS,
				function(color) {
					return !_.includes(
						_.map(data.game.players, "color"),
						color
					);
				}
			);

			if (
				_.isUndefined(_getPlayer(data))
			) {
				data.game.players.push({
					user: data.user,
					sessionID: data.sessionID,
					color: playerColor,
				});
			}

			if (_.isUndefined(data.game.current_player)) {
				data.game.current_player_color = playerColor;
			}

			is_current = data.game.current_player.color === playerColor;

			return Promise.resolve(
				GameStore.saveGameState(data.game)
			).then(
				function(game) {
					const index = _.findIndex(
						game.players,
						_.bind(_findPlayer, undefined, data)
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
	);
}

const _games = {};

function ensureGame(gameName, req) {
	if (_.get(req, ["session", "games", gameName])) {
		return;
	}

	req.session.games = req.session.games || {};
	req.session.games[gameName] = req.session.games[gameName] || {};				
}

let _managerInitialized = false;

class SocketManager {
	static initialize({ server } = {}) {
		if (_managerInitialized) {
			return;
		}

		assert(server, "server object is missing");

		SocketManager._server = new IOServer(server);

		if (!Config.websockets.inline) {
			SocketManager._server.origins(Config.websockets.url);
		}

		const cParser = cookieParser(Config.session.secret);

		SocketManager._server.use(
			(socket, next) => {
				cParser(socket.request, socket.request.res, next);
			}
		);

		SocketManager._server.use(
			(socket, next) => {
				session(socket.request, socket.request.res, next);
			}
		);

		SocketManager._server.use(
			(socket, next) => {
				passport.initialize()(socket.request, socket.request.res, next);
			}
		);

		SocketManager._server.use(
			(socket, next) => {
				passport.session()(socket.request, socket.request.res, next);
			}
		);

		SocketManager._server.on("connection", SocketManager._onConnect);

		_managerInitialized = true;
	}

	static _onConnect(socket) {
		Loggers.websockets.info(
			"socket connected: " +
			JSON.stringify({
				id: socket.id,
				sessionID: socket.request.sessionID,
				remoteAddress: socket.client.conn.remoteAddress
			})
		);

		socket.on("game:get-state", function({ gameName }, fn) {
			ensureGame(gameName, this.request);
			SocketManager._onGetGameState(this, { gameName }, fn);
		});

		socket.on("board:place-marble", function({ gameName, position }, fn) {
			ensureGame(gameName, this.request);
			SocketManager._onPlaceMarble(this, { gameName, position }, fn);
		});

		socket.on("game:join", function({ gameName }, fn) {
			ensureGame(gameName, this.request);
			SocketManager._onJoinGame(this, gameName, fn);
		});

		socket.on("game:get-player-presence", function({ gameName }, fn) {
			ensureGame(gameName, this.request);
			SocketManager._onGetPlayerPresence(this, gameName, fn);
		});

		socket.on("disconnect", function() {
			SocketManager._onDisconnect(this);
		});
	}

	static _onJoinGame(socket, gameName, fn) {
		if (!gameName) {
			return;
		}

		_resolvePlayerJoinData({
			socket,
			gameName
		}).then(
			(data) => {
				if (_.isUndefined(data.color)) {
					_logGameEvent({gameName, message: "Color not found for player"});
					throw new Error("Color is undefined");
				}

				socket.request.session.games[gameName].color = data.color;
				socket.request.session.games[gameName].order = data.order;
				socket.request.session.save();

				return data;
			}
		).then(
			(data) => {
				socket.join(gameName);

				if (!_games[socket.id]) {
					_games[socket.id] = [];
				}

				_games[socket.id].push(gameName);

				_logGameEvent({
					gameName,
					message: `Player ${data.color} joined`
				});

				const playerData = _.extend(data, {
					user: data.user && data.user.toFrontendObject(),
					is_current: data.is_current,
				});

				socket.player = _.omit(
					playerData,
					[
						"is_current",
					]
				);

				socket.broadcast.to(gameName).emit(
					"game:player-joined",
					playerData
				);

				fn && fn(playerData);
			}
		).catch(
			(err) => {
				_logGameEvent({
					gameName,
					message: `Player failed to join game: ${err.message}`,
					stack: err.stack,
					level: LOG_LEVELS.ERROR
				});
				fn && fn({
					error: true,
					message: err.message,
					code: err.code,

				});
			}
		);
	}

	static _onGetGameState(socket, { gameName }, fn) {
		GameStore.getGame({
			name: gameName,
		}).then(
			(game) => {
				fn && fn({
					game: _.result(game, "toFrontendObject"),
				});
			}
		).catch(
			(err) => {
				fn && fn({
					error: true,
					message: err.message,
				});
			}
		);
	}

	static _onPlaceMarble(socket, { gameName, position }, fn) {
		const color = socket.request.session.games[gameName].color;

		GameStore.getGame({
			name: gameName,
		}).then(
			(game) =>  {
				assert(!game.is_over, "Game is over");
				assert(gameName, 'Property "gameName" is required');
				assert(position, 'Property "position" is required');

				const [column, row] = position;

				if (color !== game.current_player.color) {
					throw new Error(`Not ${color}'s turn`);
				}

				if (
					game.cellIsFilled({
						row,
						column
					})
				) {
					throw new Error(`Position ${JSON.stringify(position)} is already occupied by color ${game.getCell(column, row)}`);
				}

				const result = game.fillCell({
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
					(game) => {
						const data = {
							game,
							row,
							column,
							color,
						};

						if (result.quintros) {
							data.quintros = result.quintros;
						}

						return data;
					}
				);
			}
		).then(
			(data) => {
				_logGameEvent({
					gameName: data.game.name,
					message: `Player ${data.color} placed a marble at [${data.row}, ${data.column}]`
				});

				const eventData = {
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
					eventData.changed.current_player = eventData.game.current_player;
				}

				SocketManager._server.to(data.game.name).emit("board:marble-placed", {
					gameName: data.game.name,
					position: [data.column, data.row],
					color: data.color
				});

				if (data.game.is_over) {
					SocketManager._server.to(data.game.name).emit("game:over", {
						player: eventData.game.current_player,
						quintros: data.quintros
					});
				}
			}
		).catch(
			(err) => {
				let validationErrors = "";

				if (err.name === "ValidationError") {
					validationErrors = "Validation errors:\n" +
						err.errors.map(
							(error) =>  `${error.path}: ${error.message}`
						).join("\n\n");
				}

				_logGameEvent({
					gameName,
					message: `Error placing a marble by player ${color} at position ${JSON.stringify(position)}: ${err.message}\n${validationErrors}`,
					stack: err.stack,
					level: LOG_LEVELS.ERROR
				});

				fn && fn({
					error: true,
					message: err.message,
					code: err.code
				});
			}
		);
	}

	static _onDisconnect(socket) {
		_.each(
			_games[socket.id],
			(gameName) => {
				GameStore.getGame({
					name: gameName,
				}).then(
					(game) => {
						const player = _getPlayer({
							game,
							user: socket.request.user,
							sessionID: socket.request.session.id
						});

						_logGameEvent({gameName, message: `Player ${player.color} left`});

						socket.broadcast.to(gameName).emit(
							"game:player-left",
							{
								player: Object.assign(
									{},
									player.toObject(),
									{
										user: player.user && player.user.toFrontendObject()
									}
								)
							}
						);
					}
				);

			}
		);
	}

	static _onGetPlayerPresence(socket, gameName, fn) {
		const players = _.compact(
			_.map(
				SocketManager._server.to(gameName).connected,
				"player"
			)
		);

		fn && fn(players);
	}
}

exports = module.exports = SocketManager;
