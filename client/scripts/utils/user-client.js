import SocketClient from "project/scripts/utils/socket-client";
import getStore     from "project/scripts/redux/store";
import {
	updateUserProfile
}                   from "project/scripts/redux/actions";


class UserClient {
	static initialize() {
		SocketClient.instance.on("users:profile-changed", UserClient.onUserProfileChanged);
	}

	static onUserProfileChanged({ user }) {
		getStore().dispatch(
			updateUserProfile({
				user
			})
		);
	}

	static changeUserProfile({ userID, updates }) {
		return SocketClient.instance.emit(
			"users:change-profile",
			{
				userID,
				updates
			}
		);
	}
}

UserClient.initialize();

export default UserClient;
