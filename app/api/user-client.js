import { fromJS }   from "immutable";
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

		const handlers = {
			"users:profile-changed": (...args) => this.onUserProfileChanged(...args),
		};

		for (let eventName in handlers) {
			if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
				this.on(eventName, handlers[eventName]);
			}
		}

		this.dispose = () => {
			for (let eventName in handlers) {
				if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
					this.off(eventName, handlers[eventName]);
				}
			}

			super.dispose();
		};
	}

	onUserProfileChanged = ({ user }) => {
		this.dispatch(
			updateUserProfile({
				user: fromJS(user),
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
