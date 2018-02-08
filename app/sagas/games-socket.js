import {
	all,
	takeEvery,
	call
}                     from "redux-saga/effects";
import {
	JOIN_GAME,
	WATCH_GAME,
}                     from "@app/actions";
import clientsPromise from "@app/api/clients";

function* joinGameSaga({ payload }) {
	const { gameName } = payload;

	const { games } = yield clientsPromise;
	yield call(games.joinGame, { gameName });
}

function* watchGameSaga({ payload }) {
	const { gameName } = payload;

	const { games } = yield clientsPromise;
	yield call(games.watchGame, { gameName });
}

function* watchForWatchGame() {
	yield takeEvery(WATCH_GAME, watchGameSaga);
}

function* watchForJoinGame() {
	yield takeEvery(JOIN_GAME, joinGameSaga);
}

export default function* rootGamesSocketSaga() {
	yield all([
		watchForJoinGame(),
		watchForWatchGame(),
	]);
}
