import UsersStateRecord from "project/scripts/records/state/users";
import {
	GET_GAME,
	GET_USER,
	UPDATE_USER_PROFILE,
}                    from "project/scripts/redux/actions";

export default function usersReducer(state = new UsersStateRecord(), action) {
	switch (action.type) {
		case GET_USER: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.setIn(["items", action.payload.id], action.payload);
		}

		case UPDATE_USER_PROFILE: {
			if (action.error) {
				// TODO: handle error
				return state;
			}

			return state.setIn(["items", action.payload.id], action.payload);
		}

		case GET_GAME: {
			if (action.error) {
				return state;
			}

			const users = action.payload.players.reduce(
				(users, player) => {
					if (player.user) {
						users.push(player.user);
					}

					return users;
				},
				[]
			);

			if (users.length === 0) {
				return state;
			}

			return state.updateUsers(users);
		}

		default:
			return state;
	}
}
