import { put, call, takeLatest } from "redux-saga/effects";
import { getUserGames } from "@app/api/games";
import {
	fetchingUserGames,
	fetchedUserGames,
	GET_USER_GAMES,
} from "@app/actions";

function* fetchUserGames() {
	yield put(fetchingUserGames());
	const games = yield call(getUserGames);
	yield put(fetchedUserGames({ games }));
}

export default function* UserGamesListWatcher() {
	yield takeLatest(GET_USER_GAMES, fetchUserGames);
}
