"use strict";

const _                  = require("lodash");
const path               = require("path");
const assert             = require("assert");
const util               = require("util");
const IOServer           = require("socket.io");
const passport           = require("passport");
const cookieParser       = require("cookie-parser");
const rfrProject         = require("rfr")({
	root: path.resolve(__dirname, "..", "..", "..", "..")
});
const {
	prepareUserForFrontend
}                        = rfrProject("server/routes/utils");
const GameStore          = rfrProject("server/persistence/stores/game");
const UserStore          = rfrProject("server/persistence/stores/user");
const ErrorCodes         = rfrProject("shared-lib/error-codes");
const Board              = rfrProject("shared-lib/board");
const Config             = rfrProject("server/lib/config");
const Loggers            = rfrProject("server/lib/loggers");
const session            = rfrProject("server/lib/session");
const {
	getNextColor
}                        = rfrProject("shared-lib/players");

const LOG_LEVELS   = {
	INFO: "info",
	DEBUG: "debug",
	ERROR: "error"
};

const VALID_COLOR_IDS = Config.game.colors.map((color) => color.id);

const WATCHERS = {};

function _log({ message, level = LOG_LEVELS.INFO }) {
	assert(_.includes(LOG_LEVELS, level), `"${level}" is not a valid log level`);

	Loggers.websockets.log(level, message);
}

function _logError({ error }) {
	_log({
		message: `${error.message}\n\t${error.stack}`,
		level: LOG_LEVELS.ERROR
	});
}

function _logGameEvent({ gameName, message, level, stack }) {
	_log({ message: `<${gameName}>: ${message}${stack ? "\n" + stack : ""}`, level });
}


function _findPlayer(user, player) {
	return player.user.id === user.id;
}

function _getPlayer({game, user}) {
	return _.find(
		game.players,
		_.bind(_findPlayer, undefined, user)
	);
}

function addPlayerToGame({ socket, game, color }) {
	// If the game is full, throw error
	if (game.isFull) {
		const err = new Error("Game is full");
		err.code = ErrorCodes.GAME_FULL;

		throw err;
	}

	if (game.is_started) {
		const err = new Error("Game is already started");
		err.code = ErrorCodes.GAME_STARTED;

		throw err;
	}

	color = color || getNextColor(_.map(game.players, "color")).id;

	if (game.players.find((player) => player.color === color)) {
		const err = new Error(`Color ${color} is already in use by another player`);
		err.code = ErrorCodes.COLOR_IN_USE;

		throw err;
	}

	if (!Config.game.colors.get(color)) {
		const err = new Error(`Color ${util.inspect(color)} is not a valid color. Must be one of the following: ${VALID_COLOR_IDS.join(", ")}`);
		err.code = ErrorCodes.INVALID_COLOR;

		throw err;
	}

	return Promise.resolve(
		socket.request.user ||
			UserStore.findBySessionID(socket.request.session.id).then(
				(user) => {
					if (user) {
						return user;
					}
					else {
						return UserStore.createUser({
							sessionID: socket.request.session.id
						});
					}
				}
			)
	).then(
		(user) => GameStore.addPlayerToGame({
			gameName: game.name,
			player: {
				color,
				user
			}
		})
	).then(
		(game) => {
			const playerIndex = _.findIndex(game.players, (player) => player.color === color);

			return {
				player: game.players[playerIndex],
				playerIndex,
				game
			};
		}
	);
}

function getSocketPlayer({ socket, game }) {
	const playerIndex = _.findIndex(
		game.players,
		(player) => (
			socket.request.user ?
				player.user.id === socket.request.user.id :
				(
					player.user.sessionID === socket.request.session.id
				)
		)
	);

	if (playerIndex >= 0) {
		return {
			player: game.players[playerIndex],
			playerIndex,
			game
		};
	}

	return null;
}

function _resolvePlayerJoinData({ socket, gameName, color }) {
	return GameStore.getGame({
		name: gameName
	}).then(
		(game) => {
			const result = getSocketPlayer({ socket, game });

			return Promise.resolve(
				result === null ?
					addPlayerToGame({ socket, game, color }) :
					result
			).then(
				({ player, playerIndex, game }) => ({
					game,
					player,
					order: playerIndex
				})
			);
		}
	).then(
		(data) => {
			if (
				!data.player.user.isAnonymous &&
				!socket.request.user
			) {
				return new Promise(
					(resolve, reject) => {
						socket.request.logIn(data.player.user, (err) => {
							if (err) {
								reject(err);
								return;
							}

							resolve(data);
						});
					}
				);
			}

			return data;
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
	static initialize({ server }) {
		if (_managerInitialized) {
			return;
		}

		assert(server, "server object is missing");

		let origins;

		if (!Config.websockets.inline) {
			origins = [Config.app.address.origin.replace(/^http(s)?:\/\//, "")];
		}

		SocketManager._server = new IOServer(server, {
			origins,
			path: Config.websockets.path,
			cookie: false,
		});

		SocketManager._server.use(
			(socket, next) => {
				cookieParser(Config.session.secret)(socket.request, socket.request.res, next);
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

		socket.on("board:place-marble", function({ gameName, position }, fn) {
			ensureGame(gameName, this.request);
			SocketManager._onPlaceMarble(this, { gameName, position }, fn);
		});

		socket.on("game:join", function({ gameName, color }, fn) {
			ensureGame(gameName, this.request);
			SocketManager._onJoinGame(this, gameName, color, fn);
		});

		socket.on("game:watch", function({ gameName }, fn) {
			ensureGame(gameName, this.request);
			SocketManager._onWatchGame(this, gameName, fn);
		});

		socket.on("game:watchers", function({ gameName }, fn) {
			ensureGame(gameName, this.request);
			SocketManager._getWatchers(this, gameName, fn);
		});

		socket.on("game:players:presence", function({ gameName }, fn) {
			ensureGame(gameName, this.request);
			SocketManager._onGetPlayerPresence(this, gameName, fn);
		});

		socket.on("game:start", function({ gameName }, fn) {
			ensureGame(gameName, this.request);
			SocketManager._onGameStart(this, gameName, fn);
		});

		socket.on("users:change-profile", function({ userID, updates }, fn) {
			if (userID === undefined) {
				userID = this.request.user;
			}

			let sessionID;

			if (!userID) {
				sessionID = this.req.session.id;
			}

			UserStore.updateUser({
				userID,
				sessionID,
				updates
			}).then(
				(user) => {
					this.broadcast.emit("users:profile-changed", {
						user: prepareUserForFrontend({ user, request: this.request })
					});

					this.emit("users:profile-changed", {
						user: prepareUserForFrontend({ user, request: this.request })
					});
				}
			).catch(
				(err) => {
					_logError({
						error: err
					});
					fn && fn({
						error: true,
						message: err.message,
						code: err.code
					});
				}
			);
		});

		socket.on("disconnect", function() {
			SocketManager._onDisconnect(this);
		});
	}

	static _onWatchGame(socket, gameName, fn) {
		if (!gameName) {
			const error = new Error("No gameName specified");
			_logError({
				error
			});

			fn && fn(error);
			return;
		}

		socket.join(gameName);
		if (!WATCHERS[gameName]) {
			WATCHERS[gameName] = [];
		}
		WATCHERS[gameName].push({
			user: socket.request.user,
			sessionID: socket.request.user ?
				undefined :
				socket.request.sessionID,
		});

		this._server.sockets.in(gameName).emit(
			"game:watchers:added",
			{
				gameName,
				user: socket.request.user &&
					prepareUserForFrontend({
						user: socket.request.user,
						request: socket.request
					}) ||
					{
						sessionID: socket.request.sessionID,
					},
			}
		);

		fn && fn({});
	}

	static _getWatchers(socket, gameName, fn) {
		if (!gameName) {
			const error = new Error("No gameName specified");
			_logError({
				error
			});

			fn && fn({
				error
			});
			return;
		}

		fn && fn({
			gameName,
			watchers: WATCHERS[gameName] || [],
		});
	}

	static _onJoinGame(socket, gameName, color, fn) {
		if (!gameName) {
			return;
		}

		_resolvePlayerJoinData({
			socket,
			gameName,
			color
		}).then(
			(data) => {
				if (_.isUndefined(data.player.color)) {
					_logGameEvent({gameName, message: "Color not found for player"});
					throw new Error("Color is undefined");
				}

				socket.request.session.games[gameName].color = data.player.color;
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
					message: `Player ${data.player.color} joined`
				});

				const playerData = {
					color: data.player.color,
					user: data.player.user ?
						prepareUserForFrontend({ user: data.player.user, request: socket.request }) :
						undefined,
					isAnonymous: data.player.user.isAnonymous,
					order: data.order
				};

				socket.player = playerData;

				const joinResults = {
					gameName,
					player: playerData,
					currentPlayerColor: data.game.currentPlayer && data.game.currentPlayer.color
				};

				socket.broadcast.to(gameName).emit(
					"game:player:joined",
					joinResults
				);

				fn && fn(joinResults);
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

	static _onPlaceMarble(socket, { gameName, position }, fn) {
		const color = socket.request.session.games[gameName].color;

		GameStore.getGame({
			name: gameName,
		}).then(
			(game) =>  {
				assert(!game.isOver, "Game is over");
				assert(gameName, 'Property "gameName" is required');
				assert(position, 'Property "position" is required');

				const [column, row] = position;

				if (color !== game.currentPlayer.color) {
					const err = new Error(`Not ${color}'s turn`);
					err.code = ErrorCodes.NOT_PLAYERS_TURN;

					throw err;
				}

				if (game.cellIsFilled(position)) {
					throw new Error(`Position ${JSON.stringify(position)} is already occupied by color ${game.getCell(position)}`);
				}

				const cell = {
					position,
					color,
				};

				game.fillCell(cell);

				const quintros = new Board({
					width: game.board.width,
					height: game.board.height,
					// game.board.filled is a collection of Mongo documents, so convert it to an
					// array of plain objects for Board to work with
					filledCells: game.board.filled.toObject(),
				}).getQuintros({
					startCell: cell,
				});

				if (quintros.size > 0) {
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

						if (quintros.size > 0) {
							data.quintros = quintros.toJS();
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

				if (data.game.isOver) {
					SocketManager._server.to(data.game.name).emit("game:over", {
						gameName: data.game.name,
						winner: data.game.currentPlayer,
						quintros: data.quintros
					});
				}
				else {
					SocketManager._server.to(data.game.name).emit("game:currentPlayer:changed", {
						gameName: data.game.name,
						color: data.game.currentPlayer.color
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
		_games[socket.id] && _games[socket.id].forEach(
			(gameName) => {
				if (WATCHERS[gameName]) {
					let watcherIndex;

					if (socket.request.user) {
						watcherIndex = WATCHERS[gameName].findIndex(
							(watcher) => watcher.user && (watcher.user._id === socket.request.user._id)
						);
					}
					else {
						watcherIndex = WATCHERS[gameName].findIndex(
							(watcher) => watcher.sessionID === socket.request.sessionID
						);
					}

					if (watcherIndex >= 0) {
						// Remove from watchers
						WATCHERS[gameName].splice(watcherIndex, 1);
						socket.broadcast.to(gameName).emit(
							"game:watchers:removed",
							{
								gameName,
								user: socket.request.user &&
									prepareUserForFrontend({
										user: socket.request.user,
										request: socket.request
									}) ||
									{
										sessionID: socket.request.sessionID,
									},
							}
						);
					}
				}

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
							"game:player:left",
							{
								gameName,
								player: Object.assign(
									player.toObject(),
									{
										user: prepareUserForFrontend({ user: player.user, request: socket.request })
									}
								)
							}
						);
					}
				).catch(
					(err) => {
						_logGameEvent({
							gameName,
							message: `Error responding to socket disconnect for game ${gameName}: ${err.message}`,
							stack: err.stack,
							level: LOG_LEVELS.ERROR
						});
					}
				);
			}
		);
	}

	static _onGetPlayerPresence(socket, { gameName }, fn) {
		const players = _.compact(
			_.map(
				SocketManager._server.to(gameName).connected,
				"player"
			)
		);

		fn && fn({
			presentPlayers: players
		});
	}

	static _onGameStart(socket, gameName, fn) {
		GameStore.getGame({
			name: gameName,
		}).then(
			(game) => {
				return game.start();
			}
		).then(
			(game) => {
				SocketManager._server.to(gameName).emit(
					"game:started",
					{
						gameName
					}
				);

				SocketManager._server.to(gameName).emit(
					"game:currentPlayer:changed",
					{
						gameName,
						color: game.currentPlayer.color
					}
				);
			}
		).catch(
			(err) => {
				_logGameEvent({
					gameName,
					message: `Error starting game ${gameName}: ${err.message}`,
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
}

exports = module.exports = SocketManager;
