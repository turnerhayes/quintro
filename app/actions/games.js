import { Set } from "immutable";

export const FIND_OPEN_GAMES = "@@QUINTRO/FIND_OPEN_GAMES";

export function findOpenGames() {
	return {
		type: FIND_OPEN_GAMES,
		payload: Set(),
	};
}

export const GET_USER_GAMES = "@@QUINTRO/GAMES/GET_USER_GAMES";

export function getUserGames() {
	return {
		type: GET_USER_GAMES,
	};
}

export const CREATE_GAME = "@@QUINTRO/GAMES/CREATE_GAME";

export function createGame({
	name,
	width,
	height,
	playerLimit,
}) {
	return {
		type: CREATE_GAME,
		payload: {
			name,
			width,
			height,
			playerLimit,
		},
	};
}

export const GAME_CREATED = "@@QUINTRO/GAMES/GAME_CREATED";

export function gameCreated({ game }) {
	return {
		type: GAME_CREATED,
		payload: { game },
	};
}

export const FETCHING_USER_GAMES = "@@QUINTRO/GAMES/FETCHING_USER_GAMES";

export function fetchingUserGames() {
	return {
		type: FETCHING_USER_GAMES,
	};
}

export const FETCHED_USER_GAMES = "@@QUINTRO/GAMES/FETCHED_USER_GAMES";

export function fetchedUserGames({ games }) {
	return {
		type: FETCHED_USER_GAMES,
		payload: { games },
	};
}

export const GET_GAME = "@@QUINTRO/GAMES/GET";

export function getGame({ name }) {
	return {
		type: GET_GAME,
		payload: { name },
	};
}

export const FETCHING_GAME = "@@QUINTRO/GAMES/FETCHING";

export function fetchingGame({ name }) {
	return {
		type: FETCHING_GAME,
		payload: { name },
	};
}

export const FETCHED_GAME = "@@QUINTRO/GAMES/FETCHED";

export function fetchedGame({ game }) {
	return {
		type: FETCHED_GAME,
		payload: { game },
	};
}

export const CHECK_GAME_NAME = "@@QUINTRO/GAMES/CHECK_GAME_NAME";

export function checkGameName({ name }) {
	return {
		type: CHECK_GAME_NAME,
		payload: { name },
	};
}

export const CHECKED_GAME_NAME = "@@QUINTRO/GAMES/CHECKED_GAME_NAME";

export function checkedGameName({ result }) {
	return {
		type: CHECKED_GAME_NAME,
		payload: { result },
	};
}

export const JOIN_GAME = "@@QUINTRO/GAMES/JOIN";

export function joinGame({ gameName }) {
	return {
		type: JOIN_GAME,
		payload: { gameName },
	};
}

export const WATCH_GAME = "@@QUINTRO/GAMES/WATCH";

export function watchGame({ gameName }) {
	return {
		type: WATCH_GAME,
		payload: { gameName },
	};
}

export const START_GAME = "@@QUINTRO/GAMES/START";

export function startGame({ gameName }) {
	return {
		type: START_GAME,
		payload: { gameName },
	};
}

export const SET_WINNER = "@@QUINTRO/GAMES/SET_WINNER";

export function setWinner({ gameName, color }) {
	return {
		type: SET_WINNER,
		payload: { gameName, color },
	};
}

export const ADD_WATCHER = "@@QUINTRO/GAME/WATCHERS/ADD";

export function addWatcher({ gameName, user }) {
	return {
		type: ADD_WATCHER,
		payload: { gameName, user },
	};
}

export const REMOVE_WATCHER = "@@QUINTRO/GAME/WATCHERS/REMOVE";

export function removeWatcher({ gameName, user }) {
	return {
		type: REMOVE_WATCHER,
		payload: { gameName, user },
	};
}

export const ADD_PLAYER = "@@QUINTRO/GAMES/PLAYERS/ADD";

export function addPlayer({ gameName, player }) {
	return {
		type: ADD_PLAYER,
		payload: { gameName, player },
	};
}

export const SET_PLAYER = "@@QUINTRO/GAME/PLAYERS/SET_CURRENT";

export function setPlayer({ gameName, color }) {
	return {
		type: SET_PLAYER,
		payload: {
			gameName,
			color
		}
	};
}

export const SET_PLAYER_PRESENCE = "@@QUINTRO/GAME/PLAYERS/SET_PRESENCE";

export function setPlayerPresence({ gameName, presenceMap }) {
	return {
		type: SET_PLAYER_PRESENCE,
		payload: {
			gameName,
			presenceMap,
		}
	};
}

export const SET_MARBLE = "@@QUINTRO/GAME/SET_MARBLE";

export function setMarble({
	gameName,
	position,
	color
}) {
	return {
		type: SET_MARBLE,
		payload: {
			gameName,
			position,
			color,
		},
	};
}

export const SET_GAME_PLAY_ERROR = "@@QUINTRO/GAME/SET_PLAY_ERROR";

export function setGamePlayError({
	gameName,
	error
}) {
	return {
		type: SET_GAME_PLAY_ERROR,
		payload: {
			gameName,
			error,
		},
	};
}
