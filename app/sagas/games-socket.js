import createDebug    from "debug";
import {
	all,
	put,
	take,
	takeEvery,
	call,
}                     from "redux-saga/effects";
import {
	eventChannel,
}                     from "redux-saga";
import {
	JOIN_GAME,
	LEAVE_GAME,
	WATCH_GAME,
	UPDATE_GAME,
	START_GAME,
	PLACE_MARBLE,
}                     from "@app/actions";
import GameClient     from "@app/api/game-client";

const debug = createDebug("quintro:client:sagas:games-socket");

let client;

const gamesSocketChannel = eventChannel(
	(emitter) => {
		debug("Creating a games socket event channel");
		client = new GameClient({
			dispatch: (action) => emitter(action)
		});

		return () => {
			debug("Closing games socket event channel");
			client.dispose();
			client = null;
		};
	}
);

function* clientSaga(clientMethod, action) {
	yield call(client[clientMethod], action.payload);
}

function* watchForWatchGame() {
	yield takeEvery(WATCH_GAME, clientSaga, "watchGame");
}

function* watchForJoinGame() {
	yield takeEvery(JOIN_GAME, clientSaga, "joinGame");
}

function* watchForLeaveGame() {
	yield takeEvery(LEAVE_GAME, clientSaga, "leaveGame");
}

function* watchForUpdateGame() {
	yield takeEvery(UPDATE_GAME, clientSaga, "updateGame");
}

function* watchForStartGame() {
	yield takeEvery(START_GAME, clientSaga, "startGame");
}

function* watchForPlaceMarble() {
	yield takeEvery(PLACE_MARBLE, clientSaga, "placeMarble");
}

function* watchGameSocket() {
	while (client) {
		const action = yield take(gamesSocketChannel);
		yield put(action);
	}
}

export default function* rootGamesSocketSaga() {
	yield all([
		watchGameSocket(),
		watchForJoinGame(),
		watchForLeaveGame(),
		watchForWatchGame(),
		watchForUpdateGame(),
		watchForStartGame(),
		watchForPlaceMarble(),
	]);
}
