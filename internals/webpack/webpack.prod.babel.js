// Important modules this config uses
const baseWebpackConfig = require("./webpack.base.babel");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const OfflinePlugin = require("offline-plugin");
const rfr = require("rfr");
const Config = rfr("server/lib/config");

module.exports = baseWebpackConfig({
	// In production, we skip all hot-reloading stuff
	entry: [
		path.join(Config.paths.app, "app.js"),
	],

	// Utilize long-term caching by adding content hashes (not compilation hashes) to compiled assets
	output: {
		filename: "[name].[chunkhash].js",
		chunkFilename: "[name].[chunkhash].chunk.js",
	},

	plugins: [
		new webpack.optimize.ModuleConcatenationPlugin(),
		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor",
			children: true,
			minChunks: 2,
			async: true,
		}),

		// Minify and optimize the indexFile
		new HtmlWebpackPlugin({
			filename: Config.paths.indexFile.name,
			template: Config.paths.indexFile.template,
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			},
			inject: true,
		}),

		// Put it in the end to capture all the HtmlWebpackPlugin's
		// assets manipulations and do leak its manipulations to HtmlWebpackPlugin
		new OfflinePlugin({
			relativePaths: false,
			publicPath: "/",

			ServiceWorker: {
				output: "service-worker/sw.js",
			},

			// No need to cache .htaccess. See http://mxs.is/googmp,
			// this is applied before any match in `caches` section
			excludes: [".htaccess"],

			caches: {
				main: [":rest:"],

				// All chunks marked as `additional`, loaded after main section
				// and do not prevent SW to install. Change to `optional` if
				// do not want them to be preloaded at all (cached only when first loaded)
				additional: ["*.chunk.js"],
			},

			// Removes warning for about `additional` section usage
			safeToUseOptionalCaches: true,

			AppCache: false,
		}),

		new MinifyPlugin(),
	],

	performance: {
		assetFilter: (assetFilename) => !(/(\.map$)|(^(main\.|favicon\.))/.test(assetFilename)),
	},
});
