"use strict";

const mongoose   = require("mongoose");

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		match: [/[^@]+@.+/, "{VALUE} is not a valid email address"],
		required: true,
		unique: true,
	},
	provider: {
		type: String,
		enum: [
			"facebook",
			"google",
			"twitter"
		]
	},
	providerID: {
		type: String,
		unique: true
	},
	name: {
		first: {
			type: String
		},
		middle: {
			type: String,
			default: null
		},
		last: {
			type: String,
			default: null
		},
		display: {
			type: String,
			default: null
		}
	},
	profilePhotoURL: {
		type: String,
		default: null,
		get: function(url) {
			if (this.provider === "facebook") {
				return "https://graph.facebook.com/" + this.providerID +"/picture?type=large";
			}
			else {
				return url;
			}
		}
	},
	sessionId: {
		type: String
	}
});

UserSchema.methods.toFrontendObject = function toFrontendObject() {
	const obj = this.toObject({
		virtuals: true
	});

	delete obj._id;
	delete obj.__v;
	delete obj.providerID;
	delete obj.provider;

	return obj;
};

UserSchema.pre("validate", function(next) {
	if (
		(this.username && this.sessionId) ||
		(!this.username && !this.sessionId)
	) {
		next(new Error("User must have either a username or a session ID, but not both"));
		return;
	}

	if (this.username && !this.name.first) {
		next(new Error("Non-anonymous users (users with a username) must have a first name"));
		return;
	}

	next();
});

const UserModel = mongoose.model("User", UserSchema);

exports = module.exports = UserModel;
