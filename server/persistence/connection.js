"use strict";

const mongoose = require("mongoose");
const debug = require("debug")("quintro.persistence");
const Config = require("../config");

let connection;
async function connect() {
    if (!connection) {
        debug(`Connecting to database`);
        connection = await mongoose.connect(Config.storage.db.url);
        debug("Connected to database");
        require("./models/user");
        require("./models/game");
        require("./models/session");
    }

    return connection;
}

module.exports = connect;
