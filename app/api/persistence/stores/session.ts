import {SessionModel} from "../models/session";

class SessionStore {
    static async findBySessionToken(sessionToken: string) {
        const model = await SessionModel.findOne({sessionToken});

        return model;
    }
}

export {SessionStore};