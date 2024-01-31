"use strict";

const mongoose = require("mongoose");


const SessionSchema = new mongoose.Schema({
    sessionToken: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    expires: {
        type: Date,
    },
});

const SessionModel = mongoose.model("Session", SessionSchema);

module.exports = SessionModel;
