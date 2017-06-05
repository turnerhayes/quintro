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

export const ADVANCE_PLAYER = "@QUINTRO/GAME/ADVANCE_PLAYER";

export function advancePlayer({ gameName }) {
	return {
		type: ADVANCE_PLAYER,
		payload: {
			gameName
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
