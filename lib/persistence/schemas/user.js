"use strict";

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	name: {
		first: {
			type: String,
			required: true,
		},
		middle: {
			type: String,
		},
		last: {
			type: String,
		},
	},
	username: {
		type: String,
	},
	preferredDisplayName: {
		type: String,
		"default": null
	},
	email: {
		type: String,
		match: [/[^@]+@.+/, "{VALUE} is not a valid email address"],
	},
	profilePhotoURL: {
		type: String,
	},
	facebookId: {
		type: String,
	},
});

exports = module.exports = UserSchema;
