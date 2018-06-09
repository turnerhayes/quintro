/* global fetch */

import { fromJS } from "immutable";
import { NOT_FOUND } from "http-status-codes";
import fetch from "./fetch";

function throwError(err, status) {
	const error = new Error(err.message);
	error.error = err;
	error.status = status;
	throw error;
}

function processGamesResponse(response) {
	return response.json().then(
		(json) => {
			if (!response.ok) {
				throwError(json.error, response.status);
			}

			return fromJS(json);
		}
	);
}

export function getGame({ name }) {
	return fetch(
		`/api/games/${name}`,
	).then(processGamesResponse);
}

export function findOpenGames({ numberOfPlayers } = {}) {
	const query = {
		onlyOpenGames: true,
	};

	if (numberOfPlayers) {
		query.numberOfPlayers = numberOfPlayers;
	}

	return fetch(
		"/api/games",
		{
			query,
		}
	).then(processGamesResponse);
}

export function getUserGames() {
	return fetch(
		"/api/games",
		{
			query: {
				includeUserGames: true,
			},
		}
	).then(processGamesResponse);
}

export function checkName({ name }) {
	return fetch(
		`/api/games/${name}`,
		{
			method: "HEAD"
		}
	).then((response) => {
		if (response.status === NOT_FOUND) {
			return false;
		}

		if (response.ok) {
			return true;
		}

		throw new Error(`Error checking name: ${response.statusText} (${response.status})`);
	});
}

export function createGame({
	name,
	width,
	height,
	playerLimit,
}) {
	return fetch(
		`/api/games/${encodeURIComponent(name)}`,
		{
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				name,
				width,
				height,
				playerLimit,
			}),
		}
	).then(processGamesResponse);
}
