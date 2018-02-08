import { Set } from "immutable";

function getCurrentPagePath() {
	return `${document.location.pathname}${document.location.search}${document.location.hash}`;
}

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

export const FETCHING_USER_GAMES = "@@QUINTRO/GAMES/FETCHING_USER_GAMES";
export const FETCHED_USER_GAMES = "@@QUINTRO/GAMES/FETCHED_USER_GAMES";


export const SET_UI_STATE = "@@QUINTRO/UI/SET_STATE";

export function setUIState({ section, settings}) {
	return {
		type: SET_UI_STATE,
		payload: {
			section,
			settings,
		},
	};
}

export const LOGIN = "@@QUINTRO/AUTH/LOGIN";

export function login({ provider }) {
	const currentPage = getCurrentPagePath();

	if (provider === "facebook") {
		document.location.href = `/auth/facebook?redirectTo=${encodeURIComponent(currentPage)}`;
	}
	else if (provider === "google") {
		document.location.href = `/auth/google?redirectTo=${encodeURIComponent(currentPage)}`;
	}
	else if (provider === "twitter") {
		document.location.href = `/auth/twitter?redirectTo=${encodeURIComponent(currentPage)}`;
	}

	return {
		type: LOGIN,
	};
}

export const LOGOUT = "@@QUINTRO/AUTH/LOGOUT";

export function logout() {
	const currentPage = getCurrentPagePath();

	document.location.href = `/logout?redirectTo=${encodeURIComponent(currentPage)}`;

	return {
		type: LOGOUT,
	};
}
