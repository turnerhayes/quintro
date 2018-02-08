"use strict";

const mongoose = require("mongoose");
const debug    = require("debug")("quintro:db");
const rfr      = require("rfr");
const Config   = rfr("server/lib/config");

mongoose.Promise = require("bluebird");

mongoose.set("debug", debug.enabled);

exports = module.exports = mongoose.connect(Config.storage.db.url);
