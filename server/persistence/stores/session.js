const SessionModel = require("../models/session");

class SessionStore {
    static async findBySessionToken(sessionToken) {
        const model = await SessionModel.findOne({sessionToken});

        return model;
    }
}

module.exports = SessionStore;