"use strict";

var mongoose   = require('mongoose');
var UserSchema = require('../schemas/user');

var UserModel = mongoose.model('User', UserSchema);

Object.defineProperties(UserModel.prototype, {
	toFrontendObject: {
		enumerable: true,
		value: function() {
			var game = this;

			return game.toObject({
				virtuals: true,
				transform: function(doc, ret, options) {
					delete ret._id;
				}
			});
		}
	},
});

exports = module.exports = UserModel;
