import GameClient from "project/scripts/utils/game-client";
import UserClient from "project/scripts/utils/user-client";
import {
	PLACE_MARBLE,
	CHANGE_USER_PROFILE
}                 from "project/scripts/redux/actions";

export function socketMiddleware() {
	return next => action => {
		switch (action.type) {
			case PLACE_MARBLE: {
				GameClient.placeMarble(
					{
						gameName: action.payload.gameName,
						color: action.payload.color,
						position: action.payload.position,
					}
				);

				break;
			}

			case CHANGE_USER_PROFILE: {
				UserClient.changeUserProfile(action.payload);

				break;
			}
		}

		next(action);
	};
}
