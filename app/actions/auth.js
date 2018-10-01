export const LOGIN = "@@QUINTRO/AUTH/LOGIN";

export function login({ provider }) {
	return {
		type: LOGIN,
		payload: {
			provider,
		},
	};
}

export const LOGOUT = "@@QUINTRO/AUTH/LOGOUT";

export function logout() {
	return {
		type: LOGOUT,
	};
}
