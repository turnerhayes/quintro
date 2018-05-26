import {
	all,
	put,
	take,
	takeEvery,
	call,
}                     from "redux-saga/effects";
import {
	CHANGE_USER_PROFILE,
} from "@app/actions";
import createChannel from "@app/sagas/client-channel";
import UserClient from "@app/api/user-client";

const channel = createChannel(UserClient);

export function* changeUserProfileSaga(action) {
	yield call(channel.client.changeUserProfile, action.payload);
}

function* watchForChangeUserProfile() {
	yield takeEvery(CHANGE_USER_PROFILE, changeUserProfileSaga);
}

export function* watchUserSocket(channel) {
	while (channel.client) {
		const action = yield take(channel);
		yield put(action);
	}
}

export default function* rootUsersSaga() {
	yield all([
		call(watchUserSocket, channel),
		call(watchForChangeUserProfile),
	]);
}
