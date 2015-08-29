"use strict";

var path = require('path');

var rootPath = path.resolve(__dirname, '..');

var staticPath = path.join(rootPath, 'public');

module.exports = {
	"root": rootPath,
	"static": staticPath,
	"templates": path.join(staticPath, "templates"),
};
