import $          from "jquery";
import Promise    from "bluebird";
import {
	fromJS
}                 from "immutable";
import UserRecord from "project/scripts/records/user";


// TODO: factor out of individual utils
function getErrorMessageFromXHR(jqXHR) {
	return jqXHR.responseJSON &&
	jqXHR.responseJSON.error &&
	jqXHR.responseJSON.error.message ?
		jqXHR.responseJSON.error.message :
		jqXHR.responseText;
}

class UserUtils {
	static getUser({ userID }) {
		return Promise.resolve(
			$.ajax({
				url: `/api/users/${userID}`,
				type: "GET",
				dataType: "json"
			}).then(
				user => new UserRecord(fromJS(user))
			).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static getUsers({ userIDs }) {
		return Promise.resolve(
			$.ajax({
				url: `/api/users`,
				type: "GET",
				dataType: "json",
				data: {
					ids: userIDs.join(",")
				}
			}).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			)
		);
	}

	static updateProfile({ userID, updates }) {
		return Promise.resolve(
			$.ajax({
				url: `/api/users/${userID}`,
				type: "PATCH",
				dataType: "json",
				data: updates
			}).catch(
				jqXHR => {
					throw new Error(getErrorMessageFromXHR(jqXHR));
				}
			).then(
				updatedUser => new UserRecord(fromJS(updatedUser))
			)
		);
	}
}

export default UserUtils;
