import { put, call, takeEvery } from "redux-saga/effects";
import { getGame } from "@app/api/games";
import {
	fetchedGame,
	GET_GAME
} from "@app/actions";

function* getGameSaga({ payload }) {
	const game = yield call(getGame, { name: payload.name });
	yield put(fetchedGame({ game }));
}

function* watchGetGame() {
	yield takeEvery(GET_GAME, getGameSaga);
}

export default function* playGameRootSaga() {
	yield watchGetGame();
}
