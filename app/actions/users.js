export const UPDATE_USER_PROFILE = "@@QUINTRO/USERS/UPDATE_PROFILE";

export function updateUserProfile({ user }) {
	return {
		type: UPDATE_USER_PROFILE,
		payload: { user },
	};
}
