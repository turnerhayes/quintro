"use strict";

const _                  = require("lodash");
const assert             = require("assert");
const path               = require("path");
const util               = require("util");
const IOServer           = require("socket.io");
const passport           = require("passport");
const cookieParser       = require("cookie-parser");
const { fromJS }         = require("immutable");

const Config             = require("./config");
const {
	prepareUserForFrontend,
}                        = require(path.join(Config.paths.server, "routes/utils"));
const GameStore          = require(path.join(Config.paths.server, "persistence/stores/game"));
const UserStore          = require(path.join(Config.paths.server, "persistence/stores/user"));
const ErrorCodes         = require(path.join(Config.paths.sharedLib, "error-codes"));
const Loggers            = require(path.join(Config.paths.server, "lib/loggers"));
const session            = require(path.join(Config.paths.server, "lib/session"));
const { getQuintros }    = require(path.join(Config.paths.sharedLib, "selectors/quintro"));
const {
	getNextColor
}                        = require(path.join(Config.paths.sharedLib, "players"));

const LOG_LEVELS   = {
	INFO: "info",
	DEBUG: "debug",
	ERROR: "error"
};

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

function getWatchers({ gameName, socket }) {
	return {
		count: WATCHERS[gameName] ?
			WATCHERS[gameName].length :
			0,

		includesMe: !!(
			WATCHERS[gameName] &&
			WATCHERS[gameName].some(
				({ user, sessionID }) => socket.request.user ?
					// Is there a logged in user? Check against user
					socket.request.user.id === (user && user.id) :
					// No logged in user? Check against session ID
					socket.request.sessionID === sessionID
			)
		)
	};
}

/**
 * Removes a watcher from the list of watchers for the specified game.
 *
 * @param {object} args - the function arguments
 * @param {string} args.gameName - the name of the game
 * @param {socket} args.socket - the socket corresponding to the user to remove
 *
 * @returns {boolean} whether or not the watchers were actually changed
 */
function removeWatcher({ gameName, socket }) {
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

		return true;
	}

	return false;
}

function _getPlayers({game, user, sessionID}) {
	return game.players.filter(
		(player) => user ?
			player.user.id === user.id :
			player.user.sessionID === sessionID
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
		const err = new Error(`Color ${util.inspect(color)} is not a valid color. Must be one of the following: ${Config.game.colors.ids.join(", ")}`);
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

function getSocketPlayer({ socket, game, color }) {
	const playerIndex = _.findIndex(
		game.players,
		(player) => (
			player.color === color && (
				socket.request.user ?
					player.user.id === socket.request.user.id :
					(
						player.user.sessionID === socket.request.session.id
					)
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

function getSocketPlayers({ socket, game }) {
	const playerIndexes = {};
	const players = [];

	let user;

	game.players.forEach(
		(player, index) => {
			if (
				(
					socket.request.user && 
					player.user.id === socket.request.user.id
				) ||
				player.user.sessionID === socket.request.session.id
			) {
				playerIndexes[player.color] = index;
				players.push(player);
				if (!user) {
					user = player.user;
				}
			}
		}
	);

	return {
		players,
		playerIndexes,
		game,
		user,
	};
}

function _resolvePlayerJoinData({ socket, gameName, colors }) {
	return GameStore.getGame({
		name: gameName
	}).then(
		(game) => {
			const players = getSocketPlayers({ socket, game });

			const missingColors = colors.reduce(
				(missing, color) => {
					if (!(color in players.playerIndexes)) {
						missing.push(color);
					}

					return missing;
				},
				[]
			);

			if (missingColors.length === 0) {
				return players;
			}

			// This *should* never happen; the UI does not currently allow it, but this is here for sanity
			// checking/preventing malicious socket requests
			if (missingColors.length > 1) {
				const error = new Error("Cannot join more than one new player to a game at a time");
				error.code = ErrorCodes.TOO_MANY_JOINERS;

				throw error;
			}

			const color = missingColors[0];

			return Promise.resolve(
				addPlayerToGame({ socket, game, color })
			).then(
				(addedPlayerData) => {
					players.playerIndexes[color] = addedPlayerData.playerIndex;
					players.players.push(addedPlayerData.player);

					if (!players.user) {
						players.user = addedPlayerData.player.user;
					}

					return players;
				}
			);
		}
	).then(
		(data) => {
			if (
				!data.user.isAnonymous &&
				!socket.request.user
			) {
				return new Promise(
					(resolve, reject) => {
						socket.request.logIn(data.user, (err) => {
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

		socket.on("board:place-marble", function({ gameName, position, color }, fn) {
			SocketManager._onPlaceMarble(this, { gameName, position, color }, fn);
		});

		socket.on("game:join", function({ gameName, colors }, fn) {
			SocketManager._onJoinGame(this, gameName, colors, fn);
		});

		socket.on("game:leave", function({ gameName }, fn) {
			SocketManager._onLeaveGame(this, gameName, fn);
		});

		socket.on("game:watch", function({ gameName }, fn) {
			SocketManager._onWatchGame(this, gameName, fn);
		});

		socket.on("game:watchers", function({ gameName }, fn) {
			SocketManager._getWatchers(this, gameName, fn);
		});

		socket.on("game:update", function({ gameName }, fn) {
			SocketManager._onUpdateGame(this, gameName, fn);
		});

		socket.on("game:players:presence", function({ gameName }, fn) {
			SocketManager._onGetPlayerPresence(this, gameName, fn);
		});

		socket.on("game:start", function({ gameName }, fn) {
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
					user = prepareUserForFrontend({ user, request: this.request });

					delete user.isMe;

					SocketManager._server.emit("users:profile-changed", {
						user
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

	static _onUpdateGame(socket, gameName, fn) {
		const update = {
			watchers: getWatchers({ gameName, socket }),
			playerPresence: SocketManager.getPresentPlayers({ socket, gameName }),
		};

		fn && fn({ update });
	}

	static getPresentPlayers({ gameName }) {
		return _.map(
			SocketManager._server.to(gameName).connected,
			"player"
		).reduce(
			(presenceMap, player) => {
				if (player) {
					presenceMap[player.color] = true;
				}

				return presenceMap;
			},
			{}
		);
	}

	static _onWatchGame(socket, gameName, fn) {
		if (!gameName) {
			const error = new Error("No gameName specified");
			_logError({
				error
			});

			fn && fn({
				error: true,
				message: error.message
			});
			return;
		}

		socket.join(gameName);
		
		GameStore.getGame({
			name: gameName,
		}).then(
			(game) => {
				// Don't add player as a watcher if they're already a player;
				// just add their socket to the game's room
				if (!getSocketPlayer({ socket, game })) {
					if (!WATCHERS[gameName]) {
						WATCHERS[gameName] = [];
					}

					WATCHERS[gameName].push({
						user: socket.request.user,
						sessionID: socket.request.user ?
							undefined :
							socket.request.sessionID,
					});

					const watchers = {
						count: WATCHERS[gameName].length,
						includesMe: true,
					};

					const args = [
						"game:watchers:updated",
						{
							gameName,
							watchers,
						},
					];

					socket.emit(...args);

					// For other connected sockets, don't change the includesMe value,
					// because this user being included won't change whether those other users
					// are included
					delete watchers.includesMe;

					socket.broadcast.to(gameName).emit(...args);
				}

				fn && fn({});
			}
		).catch(
			(error) => {
				fn && fn({
					error: true,
					message: error.message,
					code: error.code,
				});
			}
		);
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
			watchers: getWatchers({ gameName, socket }),
		});
	}

	static _onJoinGame(socket, gameName, colors, fn) {
		if (!gameName) {
			const error = new Error("No game name provided for join message");
			error.code = ErrorCodes.INVALID_SOCKET_REQUEST;

			_logError({ error });

			fn && fn({
				error: true,
				message: error.message,
				code: error.code,
			});

			return;
		}

		_resolvePlayerJoinData({
			socket,
			gameName,
			colors,
		}).then(
			(data) => {
				socket.join(gameName);

				if (!_games[socket.id]) {
					_games[socket.id] = [];
				}

				_games[socket.id].push(gameName);

				_logGameEvent({
					gameName,
					message: `Players ${Object.keys(data.playerIndexes).join(",")} joined`,
				});

				const playerData = data.players.map(
					(player) => (
						{
							color: player.color,
							user: player.user ?
								prepareUserForFrontend({ user: player.user, request: socket.request }) :
								undefined,
							isAnonymous: player.user.isAnonymous,
							order: data.playerIndexes[player.color],
						}
					)
				);

				socket.players = playerData;

				// A player is not a watcher
				SocketManager.stopWatching({ gameName, socket });

				const joinResults = {
					gameName,
					players: playerData,
				};

				// Remove isMe for the broadcast to other players, so they don't think this
				// player is them
				joinResults.players.forEach(
					(player) => delete player.user.isMe
				);

				socket.broadcast.to(gameName).emit(
					"game:players:joined",
					joinResults
				);

				// Add it back for the callback so that the socket client knows this is them
				joinResults.players.forEach(
					(player) => player.user.isMe = true
				);

				fn && fn(joinResults);
			}
		).catch(
			(err) => {
				_logGameEvent({
					gameName,
					message: `Players failed to join game: ${err.message}`,
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

	static stopWatching({ socket, gameName, }) {
		if (!WATCHERS[gameName]) {
			return;
		}

		if (removeWatcher({ gameName, socket })) {
			const watchers = {
				count: WATCHERS[gameName].length,
				includesMe: true,
			};

			const args = [
				"game:watchers:updated",
				{
					gameName,
					watchers,
				},
			];

			// Notify socket
			socket.emit(...args);

			// For other connected socket users, don't set includesMe either way,
			// since some other user stopping watching doesn't change whether or
			// not *that* user is watching
			delete watchers.includesMe;

			// Notify others
			socket.broadcast.to(gameName).emit(...args);
		}
	}

	static leaveGame({ socket, gameName }) {
		SocketManager.stopWatching({ socket, gameName });

		return GameStore.getGame({
			name: gameName,
		}).then(
			(game) => {
				const players = _getPlayers({
					game,
					user: socket.request.user,
					sessionID: socket.request.sessionID
				});

				_logGameEvent({gameName, message: `Players ${players.map((player) => player.color).join(", ")} left`});

				socket.broadcast.to(gameName).emit(
					"game:players:left",
					{
						gameName,
						players: players.map(
							(player) => Object.assign(
								player.toObject(),
								{
									user: prepareUserForFrontend({ user: player.user, request: socket.request })
								}
							)
						),
					}
				);
			}
		);
	}

	static _onLeaveGame(socket, gameName, fn) {
		SocketManager.leaveGame({ socket, gameName });
		SocketManager.stopWatching({ socket, gameName });

		fn && fn();
	}

	static _onPlaceMarble(socket, { gameName, position, color }, fn) {
		GameStore.getGame({
			name: gameName,
		}).then(
			(game) =>  {
				assert(!game.isOver, "Game is over");
				assert(gameName, 'Property "gameName" is required');
				assert(position, 'Property "position" is required');

				const [column, row] = position;
				
				if (color !== game.getCurrentPlayerColor()) {
					const err = new Error(`Not ${color}'s turn`);
					err.code = ErrorCodes.NOT_PLAYERS_TURN;

					throw err;
				}

				const socketPlayer = getSocketPlayer({ socket, game, color });

				// If socketPlayer is null, that means the socket user is not the color's
				// user; attempt at illegal placement
				if (socketPlayer === null) {
					const err = new Error(`Cannot place marbles for ${color}`);
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

				const gameState = fromJS(game.toFrontendObject());

				const quintros = getQuintros(gameState.get("board"), {
					startCell: cell,
				});

				if (quintros.size > 0) {
					game.winner = color;
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
						winner: data.game.winner,
						quintros: data.quintros,
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
		// Leave games that the user is a player in
		_games[socket.id] && _games[socket.id].forEach(
			(gameName) => SocketManager.leaveGame({ socket, gameName }).catch(
				(err) => {
					_logGameEvent({
						gameName,
						message: `Error responding to socket disconnect for game ${gameName}: ${err.message}`,
						stack: err.stack,
						level: LOG_LEVELS.ERROR
					});
				}
			)
		);

		// Leave games that the user is watching
		for(let gameName in WATCHERS) {
			if (Object.prototype.hasOwnProperty.call(WATCHERS, gameName)) {
				SocketManager.stopWatching({ gameName, socket });
			}
		}
	}

	static _onGetPlayerPresence(socket, { gameName }, fn) {
		fn && fn({
			presentPlayers: SocketManager.getPresentPlayers({ socket, gameName }),
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
			() => {
				SocketManager._server.to(gameName).emit(
					"game:started",
					{
						gameName
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
