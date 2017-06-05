import SocketClient from "project/scripts/utils/socket-client";
import getStore    from "project/scripts/redux/store";
import {
	setMarble
}                   from "project/scripts/redux/actions";

class GameClient {
	static initialize() {
		SocketClient.instance.on("board:marble-placed", ({ gameName, position, color }) => {
			getStore().dispatch(
				setMarble({
					gameName,
					position,
					color
				})
			);
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
