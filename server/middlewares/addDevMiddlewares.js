"use strict";

const path = require("path");
const { NOT_FOUND } = require("http-status-codes");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");

function createWebpackMiddleware(compiler, publicPath) {
	return webpackDevMiddleware(compiler, {
		noInfo: true,
		publicPath,
		silent: true,
		stats: "errors-only",
	});
}

module.exports = function addDevMiddlewares(app, webpackConfig) {
	const compiler = webpack(webpackConfig);
	const middleware = createWebpackMiddleware(compiler, webpackConfig.output.publicPath);

	app.use(middleware);
	app.use(webpackHotMiddleware(compiler));

	// Since webpackDevMiddleware uses memory-fs internally to store build
	// artifacts, we use it instead
	const fs = middleware.fileSystem;

	app.get("*", (req, res) => {
		fs.readFile(path.join(compiler.outputPath, "index.html"), (err, file) => {
			if (err) {
				res.sendStatus(NOT_FOUND);
			} else {
				res.send(file.toString());
			}
		});
	});
};
