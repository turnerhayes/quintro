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

export const CREATE_GAME = "@QUINTRO/GAME/CREATE";

export function createGame({name, width, height, playerLimit}) {
	return (dispatch) => {
		return {
			type: CREATE_GAME,
			payload: GameUtils.createGame({
				name,
				width,
				height,
				playerLimit
			}).then(
				game => dispatch(push(`/game/${game.name}`))
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

export const SET_WINNER = "@QUINTRO/GAME/SET_WINNER";

export function setWinner({ gameName, winner }) {
	return {
		type: SET_WINNER,
		payload: {
			gameName,
			winner
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
