import Promise        from "bluebird";
import { Howl }       from "howler";
import Notify         from "notifyjs";
import Config         from "project/scripts/config";
import {
	SET_MARBLE,
	SET_PLAYER
}                      from "project/scripts/redux/actions";
import {
	playerSelector
}                      from "project/scripts/redux/selectors";
import marbleSoundFile from "project/sounds/marble-drop.wav";

const MARBLE_SOUND_FADE_DURATION_IN_MILLISECONDS = 500;

let marbleSound;

function playSound() {
	if (!marbleSound) {
		marbleSound = new Howl({
			src: `${Config.staticContent.url}${marbleSoundFile}`
		});
	}

	marbleSound.stop();

	marbleSound.play();

	marbleSound.fade(1, 0, MARBLE_SOUND_FADE_DURATION_IN_MILLISECONDS);
}

export default function notificationMiddleware({ getState }) {
	return next => action => {
		switch (action.type) {
			case SET_MARBLE: {
				const state = getState();

				// We know we don't need to play sounds if sounds are not enabled
				if (state.getIn(["settings", "enableSoundEffects"])) {
					const players = playerSelector(state, {
						players: state.get("games").items.get(action.payload.gameName).players
					});

					const mePlayer = players.find((player) => player.user.isMe);

					// Only play the sound if it was placed by another player
					if (!(mePlayer && mePlayer.color === action.payload.color)) {
						playSound();
					}
				}

				break;
			}

			case SET_PLAYER: {
				const state = getState();

				if (state.getIn(["settings", "enableNotifications"])) {
					const newCurrentPlayer = state.get("games").items.get(action.payload.gameName)
						.players.find((player) => player.color === action.payload.color);

					if (newCurrentPlayer.userID === state.get("users").currentID) {
						Promise.resolve(
							!Notify.needsPermission || new Promise(Notify.requestPermission)
						).then(
							() => {
								const notification = new Notify("Quintro", {
									body: "It's your turn!",
									notifyClick: () => {
										window.focus();
										notification.close();
									}
								});

								notification.show();
							}
						);
					}
				}

				break;
			}
		}

		next(action);
	};
}
