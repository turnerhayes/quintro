import SocketClient from "@app/api/socket-client";
import {
	updateUserProfile
}                   from "@app/actions";


class UserClient extends SocketClient {
	constructor({ store }) {
		if (!store) {
			throw new Error("Cannot create a UserClient without a store");
		}

		super();

		this.store = store;

		this.on("users:profile-changed", this.onUserProfileChanged);
	}

	onUserProfileChanged = ({ user }) => {
		this.store.dispatch(
			updateUserProfile({
				user
			})
		);
	}

	changeUserProfile = ({ userID, updates }) => {
		return this.emit(
			"users:change-profile",
			{
				userID,
				updates
			}
		);
	}
}

export default UserClient;
