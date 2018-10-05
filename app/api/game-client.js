import SocketClient from "@app/api/socket-client";
import {
	setMarble,
	addPlayers,
	updateWatchers,
	setPlayerPresence,
	setWinner,
	gameStarted,
	setGamePlayError,
	gameUpdated,
}                   from "@app/actions";

class GameClient extends SocketClient {
	constructor({ dispatch }) {
		if (typeof dispatch !== "function") {
			throw new Error("Cannot construct a GameClient without a dispatch function");
		}

		super();

		this.dispatch = dispatch;

		const handlers = {
			"board:marble:placed": this.onMarblePlaced,
			"game:players:joined": this.onPlayersJoined,
			"game:players:left": this.onPlayersLeft,
			"game:watchers:updated": this.onWatchersUpdated,
			"game:started": this.onGameStarted,
			"game:over": this.onGameOver,
		};

		for (let eventName in handlers) {
			// istanbul ignore else
			if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
				this.on(eventName, handlers[eventName]);
			}
		}

		const _parentDispose = this.dispose;

		this.dispose = () => {
			for (let eventName in handlers) {
				// istanbul ignore else
				if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
					this.off(eventName, handlers[eventName]);
				}
			}

			_parentDispose();
		};
	}

	onWatchersUpdated = ({ gameName, watchers }) => this.dispatch(
		updateWatchers({
			gameName,
			watchers,
		})
	)

	onGameStarted = ({ gameName }) => this.dispatch(
		gameStarted({ gameName })
	)

	onGameOver = ({ gameName, winner }) => this.dispatch(
		setWinner({ gameName, color: winner })
	)

	onMarblePlaced = ({ gameName, position, color }) => {
		this.dispatch(
			setMarble({
				gameName,
				position,
				color
			})
		);
	}

	onPlayersJoined = ({ gameName, players }) => {
		this.dispatch(
			addPlayers({
				gameName,
				players,
			})
		);
		this.dispatch(
			setPlayerPresence({
				gameName,
				presenceMap: players.reduce(
					(map, player) => {
						map[player.color] = true;

						return map;
					},
					{}
				),
			})
		);
	}

	onPlayersLeft = ({ gameName, players }) => {
		this.dispatch(
			setPlayerPresence({
				gameName,
				presenceMap: players.reduce(
					(map, player) => {
						map[player.color] = false;

						return map;
					},
					{}
				),
			})
		);
	}

	joinGame = ({ gameName, colors }) => {
		return this.emit(
			"game:join",
			{
				gameName,
				colors
			}
		).then(
			({ players }) => {
				this.onPlayersJoined({ gameName, players });
			}
		).then(
			() => this.updateGame({ gameName })
		);
	}

	leaveGame = ({ gameName }) => {
		return this.emit(
			"game:leave",
			{
				gameName,
			}
		);
	}

	setGamePlayError = ({ gameName, error }) => this.dispatch(setGamePlayError({ gameName, error }))

	watchGame = ({ gameName }) => {
		return this.emit(
			"game:watch",
			{
				gameName
			}
		);
	}

	startGame = ({ gameName }) => {
		this.emit(
			"game:start",
			{
				gameName
			}
		);
	}

	updateGame = ({ gameName }) => {
		return this.emit(
			"game:update",
			{ gameName }
		).then(
			({ update }) => this.dispatch(
				gameUpdated({
					gameName,
					update,
				})
			)
		);
	}

	placeMarble = ({ gameName, position, color }) => {
		this.setGamePlayError({ gameName, error: null });
		return this.emit(
			"board:place-marble",
			{
				gameName,
				position,
				color,
			}
		).catch(
			(error) => this.setGamePlayError({ gameName, error })
		);
	}

	updatePlayerPresence = ({ gameName }) => {
		return this.emit(
			"game:players:presence",
			{
				gameName,
			}
		).then(
			({ presentPlayers }) => {
				this.dispatch(
					setPlayerPresence({
						gameName,
						presenceMap: presentPlayers.reduce(
							(presenceMap, player) => {
								presenceMap[player.color] = true;

								return presenceMap;
							},
							{}
						),
						setMissingPlayersTo: false
					})
				);
			}
		);
	}
}

export default GameClient;
