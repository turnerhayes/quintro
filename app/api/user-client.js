import SocketClient from "@app/api/socket-client";
import {
	updateUserProfile
}                   from "@app/actions";


class UserClient extends SocketClient {
	constructor({ dispatch }) {
		if (!dispatch) {
			throw new Error("Cannot create a UserClient without a dispatch function");
		}

		super();

		this.dispatch = dispatch;

		this.on("users:profile-changed", this.onUserProfileChanged);
	}

	onUserProfileChanged = ({ user }) => {
		this.dispatch(
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
