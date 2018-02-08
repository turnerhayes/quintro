"use strict";

const express = require("express");

const router = express.Router();

router.use("/users", require("./users"));

router.use("/games", require("./games"));

exports = module.exports = router;
