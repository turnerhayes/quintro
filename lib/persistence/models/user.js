"use strict";

var mongoose   = require('mongoose');
var UserSchema = require('../schemas/user');

var UserModel = mongoose.model('User', UserSchema);

Object.defineProperties(UserModel.prototype, {
	toFrontendObject: {
		enumerable: true,
		value: function() {
			var game = this;

			var obj = game.toObject({
				virtuals: true
			});

			obj.id = obj._id;

			return obj;
		}
	},
});

exports = module.exports = UserModel;
