import { all, put, call, select, takeEvery } from "redux-saga/effects";
import { LOCATION_CHANGE } from "react-router-redux";
import { getGame } from "@app/api/games";
import {
	fetchedGame,
	leaveGame,
	GET_GAME,
} from "@app/actions";
import selectors from "@app/selectors";

function* getGameSaga({ payload }) {
	const game = yield call(getGame, { name: payload.name });
	yield put(fetchedGame({ game }));
}

function* watchGetGame() {
	yield takeEvery(GET_GAME, getGameSaga);
}

function* locationChangeSaga() {
	const joinedGames = yield select(selectors.games.getJoinedGames);
	yield all(
		joinedGames.map(
			(gameName) => put(leaveGame({ gameName }))
		).toArray()
	);
}

function* watchLocationChange() {
	yield takeEvery(LOCATION_CHANGE, locationChangeSaga);
}

export default function* playGameRootSaga() {
	yield all([
		watchGetGame(),
		watchLocationChange(),
	]);
}
