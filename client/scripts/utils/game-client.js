import SocketClient from "project/scripts/utils/socket-client";
import getStore    from "project/scripts/redux/store";
import {
	setMarble,
	setPlayer,
	addPlayer,
	setPlayerPresence,
	setWinner,
	startGame,
	gamePlayError
}                   from "project/scripts/redux/actions";

function resetGamePlayError() {
	getStore().dispatch(gamePlayError({ error: null }));
}

function onPlayerJoined({ player, gameName }) {
	getStore().dispatch(
		addPlayer({
			gameName,
			player
		})
	);
}

function onCurrentPlayerChanged({ gameName, color }) {
	getStore().dispatch(
		setPlayer({
			gameName,
			color
		})
	);
}

class GameClient {
	static initialize() {
		SocketClient.instance.on("board:marble:placed", ({ gameName, position, color }) => {
			getStore().dispatch(
				setMarble({
					gameName,
					position,
					color
				})
			);
		});

		SocketClient.instance.on("game:current_player:changed", onCurrentPlayerChanged);

		SocketClient.instance.on("game:player:joined", onPlayerJoined);

		SocketClient.instance.on("game:player:left", ({ gameName, player }) => {
			getStore().dispatch(
				setPlayerPresence({
					gameName,
					presenceMap: {
						[player.color]: false
					}
				})
			);
		});

		SocketClient.instance.on("game:started", ({ gameName }) => {
			getStore().dispatch(
				startGame({ gameName })
			);
		});

		SocketClient.instance.on("game:over", ({ gameName, winner }) => {
			getStore().dispatch(
				setWinner({ gameName, color: winner.color })
			);
		});
	}

	static joinGame({ gameName, color }) {
		return SocketClient.instance.emit(
			"game:join",
			{
				gameName,
				color
			}
		).then(
			({ player, current_player_color }) => {
				onPlayerJoined({ gameName, player });
				onCurrentPlayerChanged({ gameName, color: current_player_color });
			}
		);
	}

	static watchGame({ gameName }) {
		return SocketClient.instance.emit(
			"game:watch",
			{
				gameName
			}
		);
	}

	static startGame({ gameName }) {
		SocketClient.instance.emit(
			"game:start",
			{
				gameName
			}
		);
	}

	static placeMarble({ gameName, position }) {
		resetGamePlayError();
		return SocketClient.instance.emit(
			"board:place-marble",
			{
				gameName,
				position
			}
		).catch(
			(error) => {
				getStore().dispatch(gamePlayError({ error }));
			}
		);
	}

	static updatePlayerPresence({ gameName }) {
		return SocketClient.instance.emit(
			"game:players:presence",
			{
				gameName
			}
		).then(
			({ presentPlayers }) => {
				getStore().dispatch(
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

GameClient.initialize();

export default GameClient;
