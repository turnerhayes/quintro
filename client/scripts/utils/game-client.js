import SocketClient from "project/scripts/utils/socket-client";

class GameClient {
	static initialize() {
		SocketClient.instance.on("game:updated", (eventData) => {
			console.log(eventData);
		});
	}

	static joinGame({ gameName }) {
		SocketClient.instance.emit(
			"game:join",
			{
				gameName
			}
		);
	}

	static placeMarble({ gameName, position }) {
		return SocketClient.instance.emit(
			"board:place-marble",
			{
				gameName,
				position
			}
		);
	}
}

GameClient.initialize();

export default GameClient;
