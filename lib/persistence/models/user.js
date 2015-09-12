"use strict";

var mongoose   = require('mongoose');
var UserSchema = require('../schemas/user');

var UserModel = mongoose.model('User', UserSchema);

exports = module.exports = UserModel;
