import assert     from "assert";
import mongoose   from "mongoose";
import {GamesStore} from "./game";
import {UserModel}  from "../models/user";
import { ServerQuintroUser } from "@shared/quintro.d";

class UserStore {
	static findByID(id: string) {
		return UserModel.findById(id);
	}

	static findByIDs({ ids }: {ids: string[]}) {
		return UserModel.find({
			_id: {
				$in: ids.map(
					(id) => new mongoose.Types.ObjectId(id)
				)
			}
		});
	}

	static findBySessionID(sessionID: string) {
		return UserModel.findOne({
			sessionID
		});
	}

	static findByUsername(username: string) {
		return UserModel.findOne(
			{
				username
			},
			{
				__v: false
			}
		);
	}

	static findByProviderID(provider: string, providerID: string) {
		return UserModel.findOne({provider, providerID}, {__v: false});
	}

	static createUser({
		username,
		email,
		names,
		provider,
		providerID,
		sessionID,
	}: ServerQuintroUser) {
		return UserModel.create({
			username,
			email,
			names,
			provider,
			providerID,
			sessionID
		});
	}

	static updateUser({ userID, sessionID, updates }) {
		assert(userID || sessionID, "Must pass either a `userID` or a `sessionID` to `UserStore.updateUser()`");

		if ("displayName" in updates) {
			updates.name = updates.name || {};
			updates.name.display = updates.displayName;
			delete updates.displayName;
		}

		return (
			userID ?
				UserStore.findByID(userID) :
				UserStore.findBySessionID(sessionID)
		).then(
			(user) => {
				return UserModel.findByIdAndUpdate(
					user.id,
					updates,
					{
						new: true,
						runValidators: true
					}
				);
			}
		);
	}

	static async convertSessionUserToSiteUser({
		userID,
		sessionID,
	}: {
		userID: string;
		sessionID: string;
	}) {
		assert(userID, "`convertSessionUserToSiteUser` requires a `userID` parameter");
		assert(sessionID, "`convertSessionUserToSiteUser` requires a `sessionID` parameter");

		const sessionUser = await UserStore.findBySessionID(sessionID);
		if (!sessionUser) {
			// There's no user on this session, so there's nothing to replace
			return;
		}
		await GamesStore.replacePlayerUsers({
			userIDToReplace: new mongoose.Types.ObjectId(sessionUser.id),
			userIDToReplaceWith: new mongoose.Types.ObjectId(userID)
		});
		return UserModel.findByIdAndDelete(sessionID);
	}
}

export {UserStore};
