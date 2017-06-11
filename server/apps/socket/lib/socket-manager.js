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
	if (user && player.user) {
		return player.user.id === user.id;
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
			const player = _.find(
					game.players,
					(player) => {
						return (
							player.user &&
							socket.request.user &&
							player.user.id === socket.request.user.id
						) || (
							player.sessionID && player.sessionID === socket.request.session.id
						);
					}
				);

			if (!_.isUndefined(player)) {
				return {
					user: player.user,
					sessionID: player.sessionID,
					game
				};
			}

			// User is not currently a player; make sure there is room
			// for them to join
			if (_.size(game.players) >= game.player_limit) {
				const err = new Error("Game is full");
				err.code = ErrorCodes.GAME_FULL;

				throw err;
			}

			if (socket.request.user) {
				return {
					user: socket.request.user,
					game
				};
			}

			return {
				sessionID: socket.request.session.id,
				game
			};
		}
	).then(
		(data) => {
			return new Promise(
				(resolve, reject) => {
					if (_.isUndefined(socket.request.user) && data.user) {
						socket.request.logIn(data.user, (err) => {
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
			let playerIndex = _.findIndex(
				data.game.players,
				_.bind(_findPlayer, undefined, { user: data.user, sessionID: data.sessionID })
			);

			if (playerIndex >= 0) {
				return Object.assign(data, {
					color: data.game.players[playerIndex].color,
					order: playerIndex
				});
			}

			const playerColor = _.find(
				GameModel.COLORS,
				function(color) {
					return !_.includes(
						_.map(data.game.players, "color"),
						color
					);
				}
			);

			
			data.game.players.push({
				user: data.user,
				sessionID: data.sessionID,
				color: playerColor,
			});

			playerIndex = data.game.players.length - 1;

			if (_.isUndefined(data.game.current_player)) {
				data.game.current_player_color = playerColor;
			}

			return Promise.resolve(
				GameStore.saveGameState(data.game)
			).then(
				function(game) {
					return Object.assign(data, {
						game: game,
						color: playerColor,
						order: playerIndex,
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

		let origins;

		if (!Config.websockets.inline) {
			origins = [Config.app.address.origin.replace(/^https?\:\/\//, "")];
		}

		SocketManager._server = new IOServer(server, {
			origins,
			path: Config.websockets.path
		});


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

				const playerData = {
					color: data.color,
					user: data.user ?
						data.user.toFrontendObject :
						undefined,
					isAnonymous: !!data.sessionID,
					order: data.order
				};

				socket.player = playerData;

				socket.broadcast.to(gameName).emit(
					"game:player:joined",
					Object.assign(
						{
							gameName: data.game.name
						},
						playerData
					)
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
					const err = new Error(`Not ${color}'s turn`);
					err.code = ErrorCodes.NOT_PLAYERS_TURN;

					throw err;
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

				SocketManager._server.to(data.game.name).emit("board:marble:placed", {
					gameName: data.game.name,
					position: [data.column, data.row],
					color: data.color
				});

				if (data.game.is_over) {
					SocketManager._server.to(data.game.name).emit("game:over", {
						winner: data.game.current_player,
						quintros: data.quintros
					});
				}
				else {
					SocketManager._server.to(data.game.name).emit("game:current_player:changed", {
						gameName: data.game.name,
						color: data.game.current_player.color
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
