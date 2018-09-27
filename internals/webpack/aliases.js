require("dotenv").config();
const path = require("path");
const rfr = require("rfr");
const pathConfig = rfr("server/lib/config/paths");

module.exports = exports = {
	"@app": pathConfig.APP_PATH,
	"@shared-lib": pathConfig.SHARED_LIB_PATH,
	"@fonts": path.join(pathConfig.APP_PATH, "fonts"),
};
