"use strict";

const assert     = require("assert");
const mongoose   = require("mongoose");
const rfr        = require("rfr");
const UserModel  = rfr("server/persistence/models/user");
const GamesStore = rfr("server/persistence/stores/game");

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

	static convertSessionUserToSiteUser({ userID, sessionID }) {
		assert(userID, "`convertSessionUserToSiteUser` requires a `userID` parameter");
		assert(sessionID, "`convertSessionUserToSiteUser` requires a `sessionID` parameter");

		return UserStore.findBySessionID(sessionID).then(
			(sessionUser) => {
				if (!sessionUser) {
					// There's no user on this session, so there's nothing to replace
					return;
				}

				sessionID = mongoose.Types.ObjectId(sessionUser.id);
				userID = mongoose.Types.ObjectId(userID);

				return GamesStore.replacePlayerUsers({
					userIDToReplace: sessionID,
					userIDToReplaceWith: userID
				}).then(
					() => UserModel.findByIdAndRemove(sessionID)
				);
			}
		);
	}
}

module.exports = exports = UserStore;
