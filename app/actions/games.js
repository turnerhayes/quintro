export const FIND_OPEN_GAMES = "@@QUINTRO/GAMES/FIND_OPEN_GAMES";

export function findOpenGames({ numberOfPlayers }) {
	return {
		type: FIND_OPEN_GAMES,
		payload: {
			numberOfPlayers,
		},
	};
}

export const SET_FIND_OPEN_GAMES_RESULTS = "@@QUINTRO/GAMES/SET_FIND_OPEN_GAMES_RESULTS";

export function setFindOpenGamesResults({ games }) {
	return {
		type: SET_FIND_OPEN_GAMES_RESULTS,
		payload: {
			games,
		},
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

export function getGame({ gameName }) {
	return {
		type: GET_GAME,
		payload: { gameName },
	};
}

export const FETCHING_GAME = "@@QUINTRO/GAMES/FETCHING";

export function fetchingGame({ gameName }) {
	return {
		type: FETCHING_GAME,
		payload: { gameName },
	};
}

export const FETCHED_GAME = "@@QUINTRO/GAMES/FETCHED";

export function fetchedGame({ game }) {
	return {
		type: FETCHED_GAME,
		payload: {
			game,
		},
	};
}

export const UPDATE_GAME = "@@QUINTRO/GAMES/UPDATE";

export function updateGame({ gameName }) {
	return {
		type: UPDATE_GAME,
		payload: { gameName },
	};
}

export const GAME_UPDATED = "@@QUINTRO/GAMES/UPDATED";

export function gameUpdated({ gameName, update }) {
	return {
		type: GAME_UPDATED,
		payload: {
			gameName,
			update,
		},
	};
}

export const JOIN_GAME = "@@QUINTRO/GAMES/JOIN";

export function joinGame({ gameName, colors }) {
	return {
		type: JOIN_GAME,
		payload: {
			gameName,
			colors,
		},
	};
}

export const LEAVE_GAME = "@@QUINTRO/GAMES/LEAVE";

export function leaveGame({ gameName }) {
	return {
		type: LEAVE_GAME,
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

export const GAME_STARTED = "@@QUINTRO/GAMES/STARTED";

export function gameStarted({ gameName }) {
	return {
		type: GAME_STARTED,
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

export const UPDATE_WATCHERS = "@@QUINTRO/GAME/WATCHERS/UPDATE";

export function updateWatchers({ gameName, watchers }) {
	return {
		type: UPDATE_WATCHERS,
		payload: { gameName, watchers },
	};
}

export const ADD_PLAYERS = "@@QUINTRO/GAMES/PLAYERS/ADD";

export function addPlayers({ gameName, players }) {
	return {
		type: ADD_PLAYERS,
		payload: { gameName, players },
	};
}

export const SET_PLAYER_PRESENCE = "@@QUINTRO/GAME/PLAYERS/SET_PRESENCE";

export function setPlayerPresence({ gameName, presenceMap, setMissingPlayersTo }) {
	return {
		type: SET_PLAYER_PRESENCE,
		payload: {
			gameName,
			presenceMap,
			setMissingPlayersTo,
		}
	};
}

export const PLACE_MARBLE = "@@QUINTRO/GAME/PLACE_MARBLE";

export function placeMarble({ gameName, position, color }) {
	return {
		type: PLACE_MARBLE,
		payload: {
			gameName,
			position,
			color,
		},
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
