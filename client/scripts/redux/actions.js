import { push }   from "react-router-redux";
import GameUtils  from "project/scripts/utils/game";

export const GET_USER = "@QUINTRO/USERS/GET";

export function getUser({ userID }) {
	return {
		type: GET_USER,
		payload: userID
		// "payload": UserUtils.getUser({ userID })
	};
}

export const UPDATE_USER_PROFILE = "@QUINTRO/USERS/UPDATE";

export function updateUserProfile({ userID }) {
	return {
		type: UPDATE_USER_PROFILE,
		payload: userID
		// "payload": UserUtils.updateProfile({
		// 	userID,
		// 	location
		// })
	};
}

export const START_GAME = "@QUINTRO/GAME/START";

export function startGame({ gameName }) {
	return {
		type: START_GAME,
		payload: {
			gameName
		}
	};
}

export const CREATE_GAME = "@QUINTRO/GAME/CREATE";

export function createGame({ name, width, height, playerLimit }) {
	return (dispatch) => {
		return {
			type: CREATE_GAME,
			payload: GameUtils.createGame({
				name,
				width,
				height,
				playerLimit
			}).then(
				game => dispatch(push(`/play/${game.name}`))
			)
		};
	};
}

export const GET_GAME = "@QUINTRO/GAME/GET";

export function getGame({ gameName }) {
	return {
		type: GET_GAME,
		payload: GameUtils.getGame({
			gameName
		})
	};
}

export const CLEAR_FIND_GAMES_RESULTS = "@QUINTRO/GAMES/FIND/CLEAR";

export function clearFindGamesResults() {
	return {
		type: CLEAR_FIND_GAMES_RESULTS,
		payload: {}
	};
}

export const FIND_OPEN_GAMES = "@QUINTRO/GAMES/FIND";

export function findOpenGames({ numberOfPlayers }) {
	return (dispatch) => {
		dispatch(clearFindGamesResults());

		dispatch({
			type: FIND_OPEN_GAMES,
			payload: GameUtils.findOpenGames({
				numberOfPlayers
			})
		});
	};
}

export const GET_USER_GAMES = "@QUINTRO/GAMES/GET_USER_GAMES";

export function getUserGames() {
	return {
		type: GET_USER_GAMES,
		payload: GameUtils.getUserGames()
	};
}

export const GAME_PLAY_ERROR = "@QUINTRO/GAME/PLAY_ERROR";

export function gamePlayError({ error }) {
	return {
		type: GAME_PLAY_ERROR,
		payload: error
	};
}

export const SET_PLAYER = "@QUINTRO/GAME/SET_PLAYER";

export function setPlayer({ gameName, color }) {
	return {
		type: SET_PLAYER,
		payload: {
			gameName,
			color
		}
	};
}

export const ADD_PLAYER = "@QUINTRO/GAME/ADD_PLAYER";

export function addPlayer({ gameName, player }) {
	return {
		type: ADD_PLAYER,
		payload: {
			gameName,
			player
		}
	};
}

export const SET_PLAYER_PRESENCE = "@QUINTRO/GAME/SET_PLAYER_PRESENCE";

export function setPlayerPresence({ gameName, presenceMap, setMissingPlayersTo }) {
	return {
		type: SET_PLAYER_PRESENCE,
		payload: {
			gameName,
			presenceMap,
			setMissingPlayersTo
		}
	};
}

export const SET_WINNER = "@QUINTRO/GAME/SET_WINNER";

export function setWinner({ gameName, color }) {
	return {
		type: SET_WINNER,
		payload: {
			gameName,
			color
		}
	};
}

export const SET_MARBLE = "@QUINTRO/GAME/SET_MARBLE";

export function setMarble({ gameName, position, color }) {
	return {
		type: SET_MARBLE,
		payload: {
			gameName,
			position,
			color
		}
	};
}
