"use strict";

const path = require("path");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const rfr = require("rfr");
const Config = rfr("server/lib/config");
const {
	prepareUserForFrontend
} = rfr("server/routes/utils");
const { getIndex, handleGetIndexError } = require("./utils");

module.exports = function addDevMiddlewares(app, webpackConfig) {
	const compiler = webpack(webpackConfig);
	
	const middleware = webpackDevMiddleware(compiler, {
		noInfo: true,
		publicPath: webpackConfig.output.publicPath,
		silent: true,
		stats: "errors-only",
		// Don't serve index route--we do that in the catch-all handler below
		index: false,
	});

	function handleRequest(req, res, next) {
		getIndex({
			indexPath: path.join(compiler.outputPath, Config.paths.indexFile.name),
			context: {
				user: req.user && prepareUserForFrontend({
					user: req.user,
					request: req,
				}),
			},
			// Since webpackDevMiddleware uses memory-fs internally to store build
			// artifacts, we use it instead
			fs: middleware.fileSystem,
		})
		.catch((error) => handleGetIndexError({ error, req, res, next }))
		.then((content) => res.send(content));
	}


	app.use(middleware);
	app.use(webpackHotMiddleware(compiler));

	app.get("*", handleRequest);
};
