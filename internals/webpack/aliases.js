require("dotenv").config();
const path = require("path");
const rfr = require("rfr");
const Config = rfr("server/lib/config");

module.exports = exports = {
	"@app": Config.paths.app,
	"project/shared-lib": path.join(Config.paths.root, "shared-lib"),
	"project/app": path.join(Config.paths.app),
	"project/images": path.join(Config.paths.app, "images"),
	"project/sounds": path.join(Config.paths.app, "sounds"),
};
