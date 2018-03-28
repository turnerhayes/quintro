import { fromJS }   from "immutable";
import SocketClient from "@app/api/socket-client";
import {
	setMarble,
	setCurrentPlayer,
	addPlayer,
	updateWatchers,
	setPlayerPresence,
	setWinner,
	gameStarted,
	setGamePlayError,
	gameUpdated,
}                   from "@app/actions";

class GameClient extends SocketClient {
	constructor({ dispatch }) {
		super();

		if (!dispatch) {
			throw new Error("Cannot construct a GameClient without a dispatch function");
		}

		this.dispatch = dispatch;

		const handlers = {
			"board:marble:placed": (...args) => this.onMarblePlaced(...args),
			"game:currentPlayer:changed": (...args) => this.onCurrentPlayerChanged(...args),
			"game:player:joined": (...args) => this.onPlayerJoined(...args),
			"game:player:left": (...args) => this.onPlayerLeft(...args),
			"game:watchers:updated": (...args) => this.onWatchersUpdated(...args),
			"game:started": (...args) => this.onGameStarted(...args),
			"game:over": (...args) => this.onGameOver(...args),
		};

		for (let eventName in handlers) {
			if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
				this.on(eventName, handlers[eventName]);
			}
		}

		this.dispose = () => {
			for (let eventName in handlers) {
				if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
					this.off(eventName, handlers[eventName]);
				}
			}

			super.dispose();
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
		setWinner({ gameName, color: winner.color })
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

	onPlayerJoined = ({ gameName, player }) => {
		this.dispatch(
			addPlayer({
				gameName,
				player: fromJS(player),
			})
		);
		this.dispatch(
			setPlayerPresence({
				gameName,
				presenceMap: {
					[player.color]: true,
				},
			})
		);
	}

	onPlayerLeft = ({ gameName, player }) => {
		this.dispatch(
			setPlayerPresence({
				gameName,
				presenceMap: {
					[player.color]: false
				}
			})
		);
	}

	onCurrentPlayerChanged = ({ gameName, color }) => {
		this.dispatch(
			setCurrentPlayer({
				gameName,
				color
			})
		);
	}

	joinGame = ({ gameName, color }) => {
		return this.emit(
			"game:join",
			{
				gameName,
				color
			}
		).then(
			({ player, currentPlayerColor }) => {
				this.onPlayerJoined({ gameName, player });
				this.onCurrentPlayerChanged({ gameName, color: currentPlayerColor });
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

	getWatchers = ({ gameName }) => {
		return this.emit(
			"game:watchers",
			{
				gameName,
			}
		);
	}

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
			({ update }) => {
				this.dispatch(
					gameUpdated({
						gameName,
						update: fromJS(update),
					})
				);
			}
		);
	}

	placeMarble = ({ gameName, position }) => {
		this.setGamePlayError({ gameName, error: null });
		return this.emit(
			"board:place-marble",
			{
				gameName,
				position,
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
