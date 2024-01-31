import mongoose from "mongoose";
import { ISession } from ".";


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
        required: true,
    },
});

const SessionModel = mongoose.models.Session as mongoose.Model<ISession> || mongoose.model<ISession>("Session", SessionSchema);

export {SessionModel};
