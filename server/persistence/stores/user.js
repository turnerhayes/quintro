"use strict";

const assert    = require("assert");
const mongoose  = require("mongoose");
const rfr       = require("rfr");
const UserModel = rfr("server/persistence/models/user");

class UserStore {
	static findByID(id) {
		return UserModel.findById(id);
	}

	static findByIDs({ ids }) {
		return UserModel.find({
			_id: {
				$in: ids.map(
					(id) => mongoose.Types.ObjectId(id)
				)
			}
		});
	}

	static findBySessionID(sessionID) {
		return UserModel.findOne({
			sessionID
		});
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

	static createUser({ username, email, name, provider, providerID, sessionID }) {
		return UserModel.create({
			username,
			email,
			name,
			provider,
			providerID,
			sessionID
		});
	}

	static updateUser({ userID, sessionID, updates }) {
		assert(userID || sessionID, "Must pass either a `userID` or a `sessionID` to `UserStore.updateUser()`");

		return (
			userID ?
				UserStore.findByID(userID) :
				UserStore.findBySessionID(sessionID)
		).then(
			(user) => UserModel.findByIdAndUpdate(
				user.id,
				updates,
				{
					new: true,
					runValidators: true
				}
			)
		);
	}
}

module.exports = exports = UserStore;
