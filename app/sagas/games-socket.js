import {
	all,
	put,
	take,
	takeEvery,
	call,
}                     from "redux-saga/effects";
import {
	FETCHED_GAME,
	JOIN_GAME,
	LEAVE_GAME,
	WATCH_GAME,
	UPDATE_GAME,
	START_GAME,
	PLACE_MARBLE,
}                     from "@app/actions";
import createChannel from "@app/sagas/client-channel";
import GameClient from "@app/api/game-client";

const gameSocketChannel = createChannel(GameClient);

const { client } = gameSocketChannel;

function* clientSaga(clientMethod, action) {
	yield call(client[clientMethod], action.payload);
}

export const updateGameSaga = clientSaga.bind(undefined, "updateGame");

export const watchGameSaga = clientSaga.bind(undefined, "watchGame");

export const joinGameSaga = clientSaga.bind(undefined, "joinGame");

export const leaveGameSaga = clientSaga.bind(undefined, "leaveGame");

export const startGameSaga = clientSaga.bind(undefined, "startGame");

export const placeMarbleSaga = clientSaga.bind(undefined, "placeMarble");

export function* fetchedGameSaga(action) {
	yield call(client.updateGame, {
		gameName: action.payload.game.get("name"),
	});
}

function* watchForGameFetched() {
	yield takeEvery(FETCHED_GAME, fetchedGameSaga);
}

function* watchForWatchGame() {
	yield takeEvery(WATCH_GAME, watchGameSaga);
}

function* watchForJoinGame() {
	yield takeEvery(JOIN_GAME, joinGameSaga);
}

function* watchForLeaveGame() {
	yield takeEvery(LEAVE_GAME, leaveGameSaga);
}

function* watchForUpdateGame() {
	yield takeEvery(UPDATE_GAME, updateGameSaga);
}

function* watchForStartGame() {
	yield takeEvery(START_GAME, startGameSaga);
}

function* watchForPlaceMarble() {
	yield takeEvery(PLACE_MARBLE, placeMarbleSaga);
}

export function* watchGameSocket(channel) {
	while (gameSocketChannel.client) {
		const action = yield take(channel);
		yield put(action);
	}
}

export default function* rootGamesSocketSaga() {
	yield all([
		call(watchGameSocket, gameSocketChannel),
		call(watchForGameFetched),
		call(watchForJoinGame),
		call(watchForLeaveGame),
		call(watchForWatchGame),
		call(watchForUpdateGame),
		call(watchForStartGame),
		call(watchForPlaceMarble),
	]);
}
