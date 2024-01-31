"use strict";

const assert             = require("assert");
const util               = require("util");
const {Server}           = require("socket.io");
const cookie = require("cookie");
const Config             = require("../config");
const {
	prepareUserForFrontend,
}                        = require("../lib/utils");
const GameStore          = require("../persistence/stores/game");
const UserStore          = require("../persistence/stores/user");
const ErrorCodes         = require("../../shared-lib/error-codes");
const Loggers            = require("../lib/loggers");
const { getQuintros }    = require("../../shared-lib/dist/selectors/quintro");
const {
	getNextColor
}                        = require("../../shared-lib/dist/players");
// const session = require("../lib/session");
// const passport = require("passport");
const SessionStore = require("../persistence/stores/session");


const LOG_LEVELS = {
	INFO: "info",
	DEBUG: "debug",
	ERROR: "error"
};

const WATCHERS = {};

function _log({ message, level = LOG_LEVELS.INFO }) {
	assert(Object.values(LOG_LEVELS).includes(level), `"${level}" is not a valid log level`);

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

async function _getUserForSocket(socket) {
	if (socket.request.user) {
		return socket.request.user;
	}
	
	const user = await UserStore.findBySessionID(socket.request.session.id);

	if (user) {
		return user;
	}
	else {
		return await UserStore.createUser({
			sessionID: socket.request.session.id
		});
	}
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

async function addPlayerToGame({ socket, game, color }) {
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

	color = color || getNextColor(new Set(game.players.map(({color}) => color))).id;

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

	const user = await _getUserForSocket(socket);
	game = await GameStore.addPlayerToGame({
		gameName: game.name,
		player: {
			color,
			user
		}
	});

	let playerIndex = -1;
	for (let i = 0; i < game.players.length; i++) {
		if (game.players[i].color === color) {
			playerIndex = i;
			break;
		}
	}

	if (playerIndex < 0) {
		throw new Error("Unable to find player in game after adding it.");
	}

	return {
		player: game.players[playerIndex],
		playerIndex,
		game
	};
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

const getAugmentedPlayersForGame = async (socket, game, colors) => {
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

	const addedPlayerData = await addPlayerToGame({ socket, game, color });
	players.playerIndexes[color] = addedPlayerData.playerIndex;
	players.players.push(addedPlayerData.player);

	if (!players.user) {
		players.user = addedPlayerData.player.user;
	}

	return players;
};

const logInIfNeeded = async (data) => {
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
};

async function _resolvePlayerJoinData({ socket, gameName, colors }) {
	const game = await GameStore.getGame({
		name: gameName
	});
	const playerData = await getAugmentedPlayersForGame(socket, game, colors);
	return await logInIfNeeded(playerData);
}

const _games = {};

const sessionMiddleware = async (socket, next) => {
	const cookies = cookie.parse(socket.request.headers.cookie || "");
	const sessionID = cookies["next-auth.session-token"];
	const session = sessionID ? await SessionStore.findBySessionToken(sessionID) : null;
	socket.session = session;
	next();
};

class SocketManager {
	attachTo(httpServer) {
		const origin = Config.app.address.origin;
		this._server = new Server(httpServer, {
			path: Config.websockets.path,
			cookie: {
			  name: "io",
			  path: "/",
			  httpOnly: true,
			  sameSite: "lax"
			},
			cors: {
				origin,
				credentials: true,
			},
		});

		// this._server.engine.use(session);
		// this._server.engine.use(passport.initialize());
		// this._server.engine.use(passport.session());

		this._server.use(sessionMiddleware);

		this._server.on("connection", (socket) => {
			this._onConnect(socket);
		});
	}

	_onUpdateGame(socket, gameName, fn) {
		fn && fn({
			watchers: getWatchers({ gameName, socket }),
			playerPresence: this.getPresentPlayers({ socket, gameName }),
		});
	}

	getPresentPlayers({ gameName }) {
		return _.map(
			this._server.to(gameName).connected,
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

	async _onWatchGame(socket, gameName, fn) {
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
		
		try {
			const game = await GameStore.getGame({
				name: gameName,
			});

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
		catch(error) {
			fn && fn({
				error: true,
				message: error.message,
				code: error.code,
			});
		}
	}

	_getWatchers(socket, gameName, fn) {
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

	async _onJoinGame(socket, gameName, colors, fn) {
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

		try {
			const data = await _resolvePlayerJoinData({
				socket,
				gameName,
				colors,
			});
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
			this.stopWatching({ gameName, socket });

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
		catch(err) {
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
	}

	stopWatching({ socket, gameName, }) {
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

	async leaveGame({ socket, gameName }) {
		this.stopWatching({ socket, gameName });

		const game = await GameStore.getGame({
			name: gameName,
		});
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

	_onLeaveGame(socket, gameName, fn) {
		this.leaveGame({ socket, gameName });
		this.stopWatching({ socket, gameName });

		fn && fn();
	}

	async _onPlaceMarble(socket, { gameName, position, color }, fn) {
		let game = await GameStore.getGame({
			name: gameName,
		});
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

		try {
			game = await GameStore.saveGameState(game);
			const data = {
				game,
				row,
				column,
				color,
			};

			if (quintros.size > 0) {
				data.quintros = quintros.toJS();
			}
			_logGameEvent({
				gameName: data.game.name,
				message: `Player ${data.color} placed a marble at [${data.row}, ${data.column}]`
			});

			this._server.to(data.game.name).emit("board:marble:placed", {
				gameName: data.game.name,
				position: [data.column, data.row],
				color: data.color
			});

			if (data.game.isOver) {
				this._server.to(data.game.name).emit("game:over", {
					gameName: data.game.name,
					winner: data.game.winner,
					quintros: data.quintros,
				});
			}
		}
		catch(err) {
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
	}

	_onDisconnect(socket) {
		// Leave games that the user is a player in
		_games[socket.id] && _games[socket.id].forEach(
			(gameName) => this.leaveGame({ socket, gameName }).catch(
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
		for (let gameName in WATCHERS) {
			if (Object.prototype.hasOwnProperty.call(WATCHERS, gameName)) {
				this.stopWatching({ gameName, socket });
			}
		}
	}

	_onGetPlayerPresence(socket, { gameName }, fn) {
		fn && fn({
			presentPlayers: this.getPresentPlayers({ socket, gameName }),
		});
	}

	async _onGameStart(socket, gameName, fn) {
		try {
			const game = await GameStore.getGame({
				name: gameName,
			});
	
			game.start();
			this._server.to(gameName).emit(
				"game:started",
				{
					gameName
				}
			);
		}
		catch(err) {
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
	}

	async _onConnect(socket) {
		Loggers.websockets.info(
			"socket connected: " +
			JSON.stringify({
				id: socket.id,
				sessionID: socket.request.session.id,
				remoteAddress: socket.client.conn.remoteAddress
			})
		);

		const manager = this;

		socket.on("board:place-marble", function({ gameName, position, color }, fn) {
			manager._onPlaceMarble(this, { gameName, position, color }, fn);
		});

		socket.on("game:join", function({ gameName, colors }, fn) {
			manager._onJoinGame(this, gameName, colors, fn);
		});

		socket.on("game:leave", function({ gameName }, fn) {
			manager._onLeaveGame(this, gameName, fn);
		});

		socket.on("game:watch", function({ gameName }, fn) {
			manager._onWatchGame(this, gameName, fn);
		});

		socket.on("game:watchers", function({ gameName }, fn) {
			manager._getWatchers(this, gameName, fn);
		});

		socket.on("game:update", function({ gameName }, fn) {
			manager._onUpdateGame(this, gameName, fn);
		});

		socket.on("game:players:presence", function({ gameName }, fn) {
			manager._onGetPlayerPresence(this, gameName, fn);
		});

		socket.on("game:start", function({ gameName }, fn) {
			manager._onGameStart(this, gameName, fn);
		});

		socket.on("users:change-profile", async function({ userID, updates }, fn) {
			if (userID === undefined) {
				userID = this.request.user;
			}

			let sessionID;

			if (!userID) {
				sessionID = this.request.session.id;
			}

			try {
				const user = await UserStore.updateUser({
					userID,
					sessionID,
					updates
				});
				user = prepareUserForFrontend({ user, request: this.request });

				delete user.isMe;

				manager._server.emit("users:profile-changed", {
					user
				});
			}
			catch(err) {
				_logError({
					error: err
				});
				fn && fn({
					error: true,
					message: err.message,
					code: err.code
				});
			}
		});

		socket.on("disconnect", function() {
			manager._onDisconnect(this);
		});
	}
}

exports = module.exports = SocketManager;
