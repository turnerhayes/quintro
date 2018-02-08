/**
 * WEBPACK DLL GENERATOR
 *
 * This profile is used to cache webpack's module
 * contexts for external library and framework type
 * dependencies which will usually not change often enough
 * to warrant building them from scratch every time we use
 * the webpack process.
 */
const rfr = require("rfr");
const pkg = rfr("package.json");

if (!pkg.dllPlugin) { process.exit(0); }

const dllPlugin = rfr("internals/config").dllPlugin;

const { join } = require("path");
const defaults = require("lodash/defaultsDeep");
const webpack = require("webpack");
const baseWebpackConfig = require("./webpack.base.babel");
const Config = rfr("server/lib/config");


const dllConfig = defaults(pkg.dllPlugin, dllPlugin.defaults);
const outputPath = join(Config.paths.root, dllConfig.path);

module.exports = baseWebpackConfig({
	context: process.cwd(),
	entry: dllConfig.dlls ? dllConfig.dlls : dllPlugin.entry(pkg),
	devtool: "eval",
	output: {
		filename: "[name].dll.js",
		path: outputPath,
		library: "[name]",
	},
	plugins: [
		new webpack.DllPlugin({
			name: "[name]",
			path: join(outputPath, "[name].json"),
		}),
	],
	performance: {
		hints: false,
	},
});
