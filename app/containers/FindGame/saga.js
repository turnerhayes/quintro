import { takeLatest, put, call } from "redux-saga/effects";

import {
	FIND_OPEN_GAMES,
	setFindOpenGamesResults,
} from "@app/actions";
import { findOpenGames } from "@app/api/games";

function* findOpenGamesSaga({ payload }) {
	const games = yield call(findOpenGames, {
		numberOfPlayers: payload.numberOfPlayers,
	});

	yield put(setFindOpenGamesResults({ games }));
}

function* watchForFindOpenGameActions() {
	yield takeLatest(FIND_OPEN_GAMES, findOpenGamesSaga);
}

export default function* findGames() {
	yield call(watchForFindOpenGameActions);
}
