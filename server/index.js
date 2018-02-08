/* eslint consistent-return:0 */

"use strict";

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const HTTPStatusCodes = require("http-status-codes");
const chalk = require("chalk");
const ip = require("ip");
const Loggers = require("./lib/loggers");
const argv = require("./argv");
const port = require("./port");
const setup = require("./middlewares/frontendMiddleware");
const passportMiddleware = require("./middlewares/passport");
const Config = require("./lib/config");
const ngrok = (Config.app.isDevelopment && process.env.ENABLE_TUNNEL) || argv.tunnel ? require("ngrok") : false;
const { resolve } = require("path");

// Make sure to initalize DB connection
require("./persistence/db-connection");

const app = express();

app.use(Loggers.http);

console.log("session secret: ", Config.session.secret);
app.use(cookieParser(Config.session.secret));

app.use(require("./lib/session"));

passportMiddleware(app);

const { router, raise404 } = require('./routes');

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
app.use(router);

// In production we need to pass these values in instead of relying on webpack
setup(app, {
	outputPath: resolve(__dirname, "..", "build"),
	publicPath: "/",
});

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || "localhost";


/// catch 404 and forwarding to error handler
app.use(raise404);

/// error handlers

// Express uses the arity of the handler function to determine whether this is
// an error handler, so it needs to take 4 arguments
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
	res.status(err.status || HTTPStatusCodes.INTERNAL_SERVER_ERROR);

	const errData = {
		message: err.message,
		error: Config.app.isDevelopment ?
			{
				message: err.message,
				stack: err.stack
			} :
			{}
	};

	if (err.status !== HTTPStatusCodes.NOT_FOUND) {
		Loggers.error(err);
	}

	res.format({
		json: () => res.json(errData),
		default: () => res.render("error", errData)
	});
});

function logAppStarted(port, host, tunnelStarted) {
	const divider = chalk.gray("\n-----------------------------------");

	console.log(`Server started ! ${chalk.green("✓")}`);

	// If the tunnel started, log that and the URL it's available at
	if (tunnelStarted) {
		console.log(`Tunnel initialised ${chalk.green("✓")}`);
	}

	console.log(`
${chalk.bold("Access URLs:")}${divider}
Localhost: ${chalk.magenta(`http://${host}:${port}`)}
      LAN: ${chalk.magenta(`http://${ip.address()}:${port}`) +
(tunnelStarted ? `\n    Proxy: ${chalk.magenta(tunnelStarted)}` : "")}${divider}
${chalk.blue(`Press ${chalk.italic("CTRL-C")} to stop`)}
    `);
}


// Start your app.
app.listen(port, host, (err) => {
	if (err) {
		return Loggers.error(err);
	}

	// Connect to ngrok in dev mode
	if (ngrok) {
		ngrok.connect(port, (innerErr, url) => {
			if (innerErr) {
				return Loggers.error(innerErr);
			}

			logAppStarted(port, prettyHost, url);
		});
	} else {
		logAppStarted(port, prettyHost);
	}
});
