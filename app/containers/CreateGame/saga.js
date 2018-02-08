import { push } from "react-router-redux";
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
	yield put(checkedGameName({ result }));
}

function* watchCheckGameName() {
	yield takeLatest(CHECK_GAME_NAME, checkGameNameSaga);
}

function* createGameSaga({ payload }) {
	const game = yield call(createGame, payload);
	yield put(gameCreated({ game }));
	yield put(push(`/play/${game.get("name")}`));
}

function* watchCreateGame() {
	yield takeLatest(CREATE_GAME, createGameSaga);
}

export default function* createGameRootSaga() {
	yield all([
		watchCheckGameName(),
		watchCreateGame(),
	]);
}
