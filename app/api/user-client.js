import SocketClient from "@app/api/socket-client";
import {
	updateUserProfile
}                   from "@app/actions";


class UserClient extends SocketClient {
	constructor({ dispatch }) {
		if (typeof dispatch !== "function") {
			throw new Error("Cannot construct a UserClient without a dispatch function");
		}

		super();

		this.dispatch = dispatch;

		const handlers = {
			"users:profile-changed": this.onUserProfileChanged,
		};

		for (let eventName in handlers) {
			// istanbul ignore else
			if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
				this.on(eventName, handlers[eventName]);
			}
		}

		const _parentDispose = this.dispose.bind(this);

		this.dispose = () => {
			for (let eventName in handlers) {
				// istanbul ignore else
				if (Object.prototype.hasOwnProperty.call(handlers, eventName)) {
					this.off(eventName, handlers[eventName]);
				}
			}

			_parentDispose();
		};
	}

	onUserProfileChanged = ({ user }) => {
		this.dispatch(
			updateUserProfile({
				user,
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
