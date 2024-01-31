import mongoose from "mongoose";
import createDebug from "debug";
import StorageConfig from "@server/config/storage";

const debug = createDebug("quintro.persistence");
let connection: typeof mongoose;
async function connect() {
    if (!connection) {
        debug(`Connecting to database`);
        connection = await mongoose.connect(StorageConfig.db.url);
        debug("Connected to database");
        await Promise.all([
            import("./models/user"),
            import("./models/game"),
            import("./models/session"),
        ]);
    }

    return connection;
}

export {connect};
