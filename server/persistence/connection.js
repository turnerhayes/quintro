"use strict";

const mongoose = require("mongoose");
const debug = require("debug")("quintro.persistence");
const Config = require("../config");
async function connect() {
    debug(`Connecting to database`);
    await mongoose.connect(Config.storage.db.url);
    debug("Connected to database");
    require("./models/user");
    require("./models/game");
}

module.exports = connect;
