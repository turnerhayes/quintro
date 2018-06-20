import { push } from "connected-react-router";
import { all, put, takeLatest, call } from "redux-saga/effects";
import {
	checkedGameName,
	CHECK_GAME_NAME,
	CREATE_GAME,
	gameCreated,
}                          from "@app/actions";
import {
	checkName,
	createGame
}                          from "@app/api/games";

function* checkGameNameSaga({ payload }) {
	const result = yield call(checkName, { name: payload.name });
	const action = yield call(checkedGameName, { result });
	yield put(action);
}

function* createGameSaga({ payload }) {
	try {
		const game = yield call(createGame, payload);
		let action = yield call(gameCreated, { game });
		yield put(action);
		action = yield call(push, `/play/${game.get("name")}`);
		yield put(action);
	}
	catch (ex) {
		// TODO: handle error
		// eslint-disable-next-line no-console
		console.error(ex);
	}
}

export default function* createGameRootSaga() {
	yield all([
		takeLatest(CHECK_GAME_NAME, checkGameNameSaga),
		takeLatest(CREATE_GAME, createGameSaga),
	]);
}
