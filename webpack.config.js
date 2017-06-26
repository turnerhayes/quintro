require("dotenv").config();

const path              = require("path");
const fs                = require("fs");
const webpack           = require("webpack");
const express           = require("express");
const cors              = require("cors");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Config            = require("./server/lib/config");

const jsxFilenameRegex = /\.jsx?$/;

module.exports = {
	entry: "./client/scripts/index.jsx",

	output: {
		path: Config.paths.dist,
		publicPath: "/static/",
		filename: "js/bundle.js"
	},

	module: {
		rules: [
			{
				test: jsxFilenameRegex,
				exclude: /node_modules/,
				use: ["babel-loader", "eslint-loader"]
			},

			{
				test: /\.(less)|(css)$/,
				use: ExtractTextPlugin.extract({
					use: [
						{
							loader: "css-loader",
							options: {
								sourceMap: true,
								importLoaders: 2
							}
						},
						{
							loader: "postcss-loader",
							options: {
								sourceMap: true,
							}
						},
						{
							loader: "less-loader",
							options: {
								sourceMap: true,
								modifyVars: {
									"fa-font-path": '"/static/fonts/font-awesome"'
								}
							}
						},
					],
					publicPath: "/static/css"
				})
			},

			{
				test: /\.woff(2)?(\?.*)?$/,
				use: {
					loader: "url-loader",
					options: {
						limit: 10000,
						mimetype: "application/font-woff"
					}
				}
			},

			{
				test: /\.ttf(\?.*)?$/,
				use: "file-loader"
			},

			{
				test: /\.eot(\?.*)?$/,
				use: "file-loader"
			},

			{
				test: /client\/images.*\.png$/,
				use: {
					loader: "url-loader",
					options: {
						limit: 8192,
						name: "images/[name]-[hash].[ext]"
					}
				}
			},

			{
				test: /\.svg(\?.*)?$/,
				use: "file-loader"
			}
		]
	},

	plugins: [
		new webpack.ProvidePlugin({
			React: "react"
		}),

		// jQuery required by Bootstrap
		new webpack.ProvidePlugin({
			jQuery: "jquery",
			$: "jquery"
		}),

		new webpack.EnvironmentPlugin({
			// Necessary environment variables for shared-lib/config
			NODE_ENV: Config.app.environment,
			WEB_SOCKETS_URL: null,
			STATIC_CONTENT_URL: null,
		}),

		new ExtractTextPlugin({
			filename: "css/bundle.css",
			allChunks: true
		})
	],

	resolve: {
		extensions: [".js", ".jsx", ".json", ".less", ".css"],
		modules: [
			"node_modules",
			Config.paths.client,
			path.join(Config.paths.client, "styles")
		],
		alias: {
			"project/shared-lib": path.join(__dirname, "shared-lib"),
			"project/scripts": path.join(Config.paths.client, "scripts"),
			"project/styles": path.join(Config.paths.client, "styles"),
			"project/images": path.join(Config.paths.client, "images"),
		}
	},

	node: {
		Buffer: true,
		fs: "empty",
		assert: true,
		events: true,
		process: true
	},

	devtool: "source-map",
	// "devtool": "cheap-eval-source-map"
	// "devtool": "eval"

	devServer: {
		hot: true,
		noInfo: true,
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
};
