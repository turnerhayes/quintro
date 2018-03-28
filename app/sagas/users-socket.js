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
	CHANGE_USER_PROFILE,
} from "@app/actions";
import UserClient from "@app/api/user-client";


const debug = createDebug("quintro:client:sagas:users-socket");

let client;

const usersSocketChannel = eventChannel(
	(emitter) => {
		debug("Creating a user socket event channel");
		client = new UserClient({
			dispatch: (action) => emitter(action)
		});

		return () => {
			debug("Closing user socket event channel");
			client.dispose();
			client = null;
		};
	}
);

function* clientSaga(clientMethod, action) {
	yield call(client[clientMethod], action.payload);
}

function* watchForChangeUserProfile() {
	yield takeEvery(CHANGE_USER_PROFILE, clientSaga, "changeUserProfile");
}

function* watchUserSocket() {
	while (client) {
		const action = yield take(usersSocketChannel);
		yield put(action);
	}
}

export default function* rootUsersSaga() {
	yield all([
		watchUserSocket(),
		watchForChangeUserProfile(),
	]);
}
