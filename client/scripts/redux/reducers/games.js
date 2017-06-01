import GamesState from "project/scripts/records/state/games";
import {
	GET_GAME,
	CREATE_GAME,
	PLACE_MARBLE,
	ADVANCE_PLAYER
}                 from "project/scripts/redux/actions";

export default function gamesReducer(state = new GamesState(), action) {
	switch(action.type) {
		case GET_GAME: {
			if (action.error) {
				return state.setGetGameError(action.payload);
			}

			return state.setGetGameError(null).addGame(action.payload);
		}

		case CREATE_GAME: {
			return state.createGame(action.payload);
		}

		case PLACE_MARBLE: {
			return state.placeMarble({
				gameName: action.payload.gameName,
				color: action.payload.color,
				position: action.payload.position
			});
		}

		case ADVANCE_PLAYER: {
			return state.advancePlayer({ gameName: action.payload.gameName });
		}

		default:
			return state;
	}
}
