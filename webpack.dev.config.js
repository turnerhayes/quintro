const common            = require("./webpack.common.config.js");
const path              = require("path");
const fs                = require("fs");
const webpack           = require("webpack");
const webpackMerge      = require("webpack-merge");
const express           = require("express");
const cors              = require("cors");
const Config            = require("./server/lib/config");

exports = module.exports = webpackMerge.smart(common, {
	plugins: [
		new webpack.NamedModulesPlugin(),
	],

	devtool: "source-map",
	// "devtool": "cheap-eval-source-map"
	// "devtool": "eval"

	devServer: {
		hot: true,
		port: 7200,
		https: {
			key: (function() {
				if (!Config.app.ssl.key) {
					return undefined;
				}

				try {
					return fs.readFileSync(Config.app.ssl.key);
				}
				catch (ex) {
					// eslint-disable-next-line no-console
					console.error(ex);
					return undefined;
				}
			}()),
			cert: (function() {
				if (!Config.app.ssl.cert) {
					return undefined;
				}

				try {
					return fs.readFileSync(Config.app.ssl.cert);
				}
				catch (ex) {
					// eslint-disable-next-line no-console
					console.error(ex);
					return undefined;
				}
			}())
		},
		headers: {
			"Access-Control-Allow-Origin": "*"
		},
		setup(app) {
			app.use(
				"/static/fonts/font-awesome",
				cors({
					origin: Config.app.address.origin
				}),
				express.static(
					// Need to do this ugly resolve; using requre.resolve() doesn't seem to work,
					// possibly because the font-awesome package contains no main entry or index.js,
					// so Node treats it as not a package.
					path.resolve(__dirname, "node_modules", "font-awesome", "fonts"),
					{
						fallthrough: false
					}
				)
			);
		},
	}
});
