import GameClient from "project/scripts/utils/game-client";
import {
	PLACE_MARBLE
}                from "project/scripts/redux/actions";

export function gameSyncMiddleware() {
	return next => action => {
		switch (action.type) {
			case PLACE_MARBLE: {
				GameClient.placeMarble(
					{
						gameName: action.gameName,
						color: action.color,
						position: action.position,
					}
				);
			}
		}

		next(action);
	};
}
