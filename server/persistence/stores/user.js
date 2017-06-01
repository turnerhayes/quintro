"use strict";

// const Promise           = require("bluebird");
const rfr       = require("rfr");
const UserModel = rfr("server/persistence/models/user");
// const NotFoundException = rfr("server/persistence/exceptions/not-found");

// const UserModel = Models.User;

class UserStore {
	static findByID(id) {
		return UserModel.findById(id);
	}

	static findByUsername(username) {
		return UserModel.findOne(
			{
				username
			},
			{
				__v: false
			}
		);
	}

	static findByProviderID(provider, providerID) {
		return UserModel.findOne({provider, providerID}, {__v: false});
	}

	static createUser({ username, email, name, provider, providerID }) {
		return UserModel.create({
			username,
			email,
			name,
			provider,
			providerID
		});
	}

	// static updateUser({ userID, updates } = {}) {
	// 	const updateData = {};
	
	// 	return UserModel.update(
	// 		updateData,
	// 		{
	// 			"where": {
	// 				"id": userID
	// 			}
	// 		}
	// 	).then(
	// 		results => {
	// 			if (results.length === 0) {
	// 				throw new NotFoundException(`User with ID ${userID} was not found, so it could not be updated`);
	// 			}
	// 		}
	// 	);
	// }
}

module.exports = exports = UserStore;
