import GamesState from "project/scripts/records/state/games";
import {
	GET_GAME,
	SET_MARBLE,
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

		case SET_MARBLE: {
			return state.setMarble({
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
