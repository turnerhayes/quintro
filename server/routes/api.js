"use strict";

const express = require("express");

const router = express.Router();

router.use("/users", require("./api/users"));

router.use("/games", require("./api/games"));

exports = module.exports = router;
