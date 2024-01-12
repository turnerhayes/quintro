"use strict";

const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "..", "..", ".env"),
});
const GameModel = require("./models/game");
const UserModel = require("./models/user");
require("./connection");

GameModel.findOne({}).then((game) => {
    console.log(game);
}).catch((ex) => {
    console.error(ex);
});


