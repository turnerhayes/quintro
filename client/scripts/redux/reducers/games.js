import GamesState from "project/scripts/records/state/games";
import {
	GET_GAME,
	GET_USER_GAMES,
	FIND_OPEN_GAMES,
	CLEAR_FIND_GAMES_RESULTS,
	GAME_PLAY_ERROR,
	SET_MARBLE,
	SET_PLAYER,
	ADD_PLAYER,
	SET_PLAYER_PRESENCE,
	SET_WINNER,
	START_GAME
}                 from "project/scripts/redux/actions";

export default function gamesReducer(state = new GamesState(), action) {
	switch(action.type) {
		case GET_GAME: {
			if (action.error) {
				return state.setGetGameError(action.payload);
			}

			return state.setGetGameError(null).addGame(action.payload);
		}

		case CLEAR_FIND_GAMES_RESULTS: {
			return state.setFindResults(null).set("findGameError", null);
		}

		case FIND_OPEN_GAMES: {
			if (action.error) {
				return state.set("findGameError", action.payload);
			}

			return state.setFindResults(action.payload).set("findGameError", null);
		}

		case GET_USER_GAMES: {
			if (action.error) {
				return state.set("findGameError", action.payload);
			}

			return state.setUserGames(action.payload).set("findGameError", null);
		}

		case GAME_PLAY_ERROR: {
			return state.set("gamePlayError", action.payload);
		}

		case SET_MARBLE: {
			return state.setMarble({
				gameName: action.payload.gameName,
				color: action.payload.color,
				position: action.payload.position
			});
		}

		case SET_PLAYER: {
			return state.setPlayer({ gameName: action.payload.gameName, color: action.payload.color });
		}

		case ADD_PLAYER: {
			return state.addPlayer({ gameName: action.payload.gameName, player: action.payload.player });
		}

		case SET_PLAYER_PRESENCE: {
			return state.setPlayerPresence({
				gameName: action.payload.gameName,
				presenceMap: action.payload.presenceMap,
				setMissingPlayersTo: action.payload.setMissingPlayersTo
			});
		}

		case SET_WINNER: {
			return state.setWinner({ gameName: action.payload.gameName, color: action.payload.color });
		}

		case START_GAME: {
			return state.startGame({ gameName: action.payload.gameName });
		}

		default:
			return state;
	}
}
