import { Set }    from "immutable";
import { push }   from "react-router-redux";
import GameUtils  from "project/scripts/utils/game";
import UserUtils  from "project/scripts/utils/user";

function getCurrentPagePath() {
	return `${document.location.pathname}${document.location.search}${document.location.hash}`;
}

export const LOGOUT = "@QUINTRO/SESSION/LOGOUT";

export function logout() {
	return (dispatch) => {
		const currentPage = getCurrentPagePath();

		// Dispatch an action, mainly for logging purposes (in case we're logging
		// actions)
		dispatch(
			{
				type: LOGOUT
			}
		);

		document.location.href = `/logout?redirectTo=${encodeURIComponent(currentPage)}`;
	};
}

export const LOGIN = "@QUINTRO/SESSION/LOGIN";

export function login({ provider }) {
	return (dispatch) => {
		const currentPage = getCurrentPagePath();

		// Dispatch an action, mainly for logging purposes (in case we're logging
		// actions)
		dispatch(
			{
				type: LOGIN,
				payload: {
					provider
				}
			}
		);

		if (provider === "facebook") {
			document.location.href = `/auth/facebook?redirectTo=${encodeURIComponent(currentPage)}`;
		}
		else if (provider === "google") {
			document.location.href = `/auth/google?redirectTo=${encodeURIComponent(currentPage)}`;
		}
		else if (provider === "twitter") {
			document.location.href = `/auth/twitter?redirectTo=${encodeURIComponent(currentPage)}`;
		}
	};
}

export const GET_USERS = "@QUINTRO/USERS/GET";

export function getUsers({ userIDs }) {
	return (dispatch, getState) => {
		userIDs = Set.of(...userIDs);
		if (userIDs.size === 0) {
			// Nothing requested, nothing to do
			return;
		}

		const missingUsers = userIDs.subtract(Set.fromKeys(getState().get("users").items));

		if (missingUsers.size === 0) {
			// Have the users; no need to fetch any
			return;
		}

		return dispatch({
			type: GET_USERS,
			payload: UserUtils.getUsers({
				userIDs: userIDs.toArray()
			})
		});
	};
}

export const UPDATE_USER_PROFILE = "@QUINTRO/USERS/UPDATE";

export function updateUserProfile({ user }) {
	return {
		type: UPDATE_USER_PROFILE,
		payload: {
			user
		}
	};
}

export const CHANGE_USER_PROFILE = "@QUINTRO/USERS/CHANGE";

export function changeUserProfile({ userID, updates }) {
	return {
		type: CHANGE_USER_PROFILE,
		payload: {
			userID,
			updates
		}
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

// This represents a request from this player to place a marble
export const PLACE_MARBLE = "@QUINTRO/GAME/PLACE_MARBLE";

export function placeMarble({ gameName, position }) {
	return {
		type: PLACE_MARBLE,
		payload: {
			gameName,
			position
		}
	};
}

// This represents a notification that a marble should be set in the game
// (whether as a play from another player or this player)
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

export const CHANGE_SETTING = "@QUINTRO/SETTINGS/CHANGE";

export function changeSetting(settingValues) {
	return {
		type: CHANGE_SETTING,
		payload: settingValues
	};
}

