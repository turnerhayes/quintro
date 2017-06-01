"use strict";

const mongoose = require("mongoose");
const rfr      = require("rfr");
const Config   = rfr("server/lib/config");

mongoose.Promise = require("bluebird");

exports = module.exports = mongoose.connect(Config.storage.db.url);
