import { all, put, call, select, takeEvery } from "redux-saga/effects";
import { LOCATION_CHANGE } from "react-router-redux";
import { Howl } from "howler";
import urlJoin from "proper-url-join";
import { getGame } from "@app/api/games";
import {
	fetchedGame,
	leaveGame,
	GET_GAME,
	SET_MARBLE,
} from "@app/actions";
import selectors from "@app/selectors";
import Config from "@app/config";
import marbleSoundFile from "@app/sounds/marble-drop.wav";

const MARBLE_SOUND_FADE_DURATION_IN_MILLISECONDS = 500;

let marbleSound;

function playSound() {
	if (!marbleSound) {
		marbleSound = new Howl({
			src: urlJoin(Config.staticContent.url, marbleSoundFile),
		});
	}

	marbleSound.stop();

	marbleSound.play();

	marbleSound.fade(1, 0, MARBLE_SOUND_FADE_DURATION_IN_MILLISECONDS);
}

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

function* setMarbleSaga() {
	// TODO: put setting names as constants somewhere
	const soundsEnabled = !!(yield select(selectors.settings.getSetting, { settingName: "enableSoundEffects" }));
	if (soundsEnabled) {
		playSound();
	}
}

function* watchLocationChange() {
	yield takeEvery(LOCATION_CHANGE, locationChangeSaga);
}

function* watchSetMarble() {
	yield takeEvery(SET_MARBLE, setMarbleSaga);
}

export default function* playGameRootSaga() {
	yield all([
		watchGetGame(),
		watchLocationChange(),
		watchSetMarble(),
	]);
}
