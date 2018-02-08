import SocketClient from "@app/api/socket-client";
import {
	setMarble,
	setPlayer,
	addPlayer,
	addWatcher,
	removeWatcher,
	setPlayerPresence,
	setWinner,
	startGame,
	setGamePlayError
}                   from "@app/actions";

class GameClient extends SocketClient {
	constructor({ store }) {
		super();

		if (!store) {
			throw new Error("Cannot construct a GameClient without a store");
		}

		this.store = store;

		const handlers = {
			"board:marble:placed": this.onMarblePlaced,
			"game:currentPlayer:changed": this.onCurrentPlayerChanged,
			"game:player:joined": this.onPlayerJoined,
			"game:player:left": this.onPlayerLeft,
			"game:watchers:added": this.onWatcherAdded,
			"game:watchers:removed": this.onWatcherRemoved,
			"game:started": this.onGameStarted,
			"game:over": this.onGameOver,
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
		};
	}

	onWatcherAdded = ({ gameName, user }) => this.store.dispatch(
		addWatcher({
			gameName,
			user,
		})
	)

	onWatcherRemoved = ({ gameName, user }) => this.store.dispatch(
		removeWatcher({
			gameName,
			user,
		})
	)

	onGameStarted = ({ gameName }) => this.store.dispatch(
		startGame({ gameName })
	)

	onGameOver = ({ gameName, winner }) => this.store.dispatch(
		setWinner({ gameName, color: winner.color })
	)

	onMarblePlaced = ({ gameName, position, color }) => {
		this.store.dispatch(
			setMarble({
				gameName,
				position,
				color
			})
		);
	}

	onPlayerJoined = ({ gameName, player }) => this.store.dispatch(
		addPlayer({
			gameName,
			player
		})
	)

	onPlayerLeft = ({ gameName, player }) => this.store.dispatch(
		setPlayerPresence({
			gameName,
			presenceMap: {
				[player.color]: false
			}
		})
	)

	onCurrentPlayerChanged = ({ gameName, color }) => this.store.dispatch(
		setPlayer({
			gameName,
			color
		})
	)

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
		);
	}

	setGamePlayError = ({ gameName, error }) => this.store.dispatch(setGamePlayError({ gameName, error }))

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

	placeMarble = ({ gameName, position }) => {
		this.setGamePlayError({ gameName, error: null });
		return this.emit(
			"board:place-marble",
			{
				gameName,
				position
			}
		).catch(
			(error) => this.setGamePlayError({ gameName, error })
		);
	}

	updatePlayerPresence = ({ gameName }) => {
		return this.emit(
			"game:players:presence",
			{
				gameName
			}
		).then(
			({ presentPlayers }) => {
				this.store.dispatch(
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

/// DEBUG
window.__GameClient = GameClient;
/// END DEBUG

export default GameClient;
