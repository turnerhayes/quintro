/* global Promise */

import { all, put, call, select, takeEvery } from "redux-saga/effects";
import { LOCATION_CHANGE } from "connected-react-router";
import { Howl } from "howler";
import Notify from "notifyjs";
import urlJoin from "proper-url-join";

import { formatMessage } from "@app/components/IntlContextExposer";
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

import messages from "./messages";

const MARBLE_SOUND_FADE_DURATION_IN_MILLISECONDS = 500;

let marbleSound;

function playSound() {
	/* istanbul ignore else */
	if (!marbleSound) {
		marbleSound = new Howl({
			src: urlJoin(Config.staticContent.url, marbleSoundFile),
		});
	}

	marbleSound.stop();

	marbleSound.play();

	marbleSound.fade(1, 0, MARBLE_SOUND_FADE_DURATION_IN_MILLISECONDS);
}

function showNotification() {
	return Promise.resolve(
		!Notify.needsPermission || new Promise(Notify.requestPermission)
	).then(
		() => {
			const notification = new Notify(formatMessage(messages.notification.title), {
				body: formatMessage(messages.notification.message),
				notifyClick: () => {
					window.focus();
					notification.close();
				}
			});

			notification.show();
		}
	);
}

export function* getGameSaga({ payload }) {
	const game = yield call(getGame, { name: payload.name });
	yield put(fetchedGame({ game }));
}

export function* locationChangeSaga() {
	const joinedGames = yield select(selectors.games.getJoinedGames);
	yield all(
		joinedGames.map(
			(gameName) => put(leaveGame({ gameName }))
		).toArray()
	);
}

export function* setMarbleSaga({ payload }) {
	// TODO: put setting names as constants somewhere
	const soundsEnabled = !!(yield select(selectors.settings.getSetting, { settingName: "enableSoundEffects" }));
	if (soundsEnabled) {
		playSound();
	}
	const notificationsEnabled = !!(yield select(selectors.settings.getSetting, { settingName: "enableNotifications" }));
	if (notificationsEnabled) {
		const newCurrentPlayer = yield select(selectors.games.getCurrentPlayer, { gameName: payload.gameName });
		const currentPlayerUser = yield select(selectors.users.getUserByID, { userID: newCurrentPlayer.get("userID") });
	
		if (currentPlayerUser.get("isMe")) {
			yield call(showNotification);
		}
	}
}

export default function* playGameRootSaga() {
	yield all([
		takeEvery(GET_GAME, getGameSaga),
		takeEvery(LOCATION_CHANGE, locationChangeSaga),
		takeEvery(SET_MARBLE, setMarbleSaga),
	]);
}
