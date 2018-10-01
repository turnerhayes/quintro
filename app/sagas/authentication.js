import { all, call, takeEvery } from "redux-saga/effects";

import { VALID_PROVIDERS } from "@app/utils/constants";
import {
	LOGIN,
	LOGOUT,
} from "@app/actions";

function getCurrentPagePath() {
	return `${document.location.pathname}${document.location.search}${document.location.hash}`;
}

export function* loginSaga({ payload }) {
	if (!VALID_PROVIDERS.includes(payload.provider)) {
		throw new Error(`Unrecognized login provider "${payload.provider}"`);
	}

	const currentPath = getCurrentPagePath();
	
	const loginPath = `/auth/${payload.provider}?redirectTo=${encodeURIComponent(currentPath)}`;
	
	yield call([document.location, document.location.assign], loginPath);
}

export function* logoutSaga() {
	const currentPath = getCurrentPagePath();

	const logoutPath = `/auth/logout?redirectTo=${encodeURIComponent(currentPath)}`;

	yield call([document.location, document.location.assign], logoutPath);
}

export default function* watcherSaga() {
	yield all([
		takeEvery(LOGIN, loginSaga),
		takeEvery(LOGOUT, logoutSaga),
	]);
}
