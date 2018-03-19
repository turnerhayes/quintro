function getCurrentPagePath() {
	return `${document.location.pathname}${document.location.search}${document.location.hash}`;
}


export const LOGIN = "@@QUINTRO/AUTH/LOGIN";

export function login({ provider }) {
	const currentPage = getCurrentPagePath();

	if (provider === "facebook") {
		document.location.href = `/auth/facebook?redirectTo=${encodeURIComponent(currentPage)}`;
	}
	else if (provider === "google") {
		document.location.href = `/auth/google?redirectTo=${encodeURIComponent(currentPage)}`;
	}
	else if (provider === "twitter") {
		document.location.href = `/auth/twitter?redirectTo=${encodeURIComponent(currentPage)}`;
	}

	return {
		type: LOGIN,
	};
}

export const LOGOUT = "@@QUINTRO/AUTH/LOGOUT";

export function logout() {
	const currentPage = getCurrentPagePath();

	document.location.href = `/auth/logout?redirectTo=${encodeURIComponent(currentPage)}`;

	return {
		type: LOGOUT,
	};
}
