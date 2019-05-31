import { push } from "connected-react-router";
import { all, put, takeLatest, call } from "redux-saga/effects";
import {
	CREATE_GAME,
	gameCreated,
	removeUIState,
}                          from "@app/actions";
import {
	createGame
}                          from "@app/api/games";

import { SECTION_NAME }    from "./CreateGame";

function* createGameSaga({ payload }) {
	try {
		const game = yield call(createGame, payload);
		let action = yield call(gameCreated, { game });
		yield put(action);
		action = yield call(removeUIState, { section: SECTION_NAME });
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
		takeLatest(CREATE_GAME, createGameSaga),
	]);
}
