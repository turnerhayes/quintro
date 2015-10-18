"use strict";

var debug         = require('debug')('quintro:app');

if (process.env.IS_HEROKU) {
	debug('Running setup for Heroku');
	require('./heroku-setup');
}

var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var fs            = require('fs');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var hbs           = require('express-hbs');
var http          = require('http');
var mongoose      = require('mongoose');
var log           = require('log4js');
var MongoUtils    = require('./lib/utils/mongo');
var config        = require('./lib/utils/config-manager');
var setupPassport = require('./passport-authentication');
var session       = require('./session');

var indexRoutes          = require('./routes/index');
var authenticationRoutes = require('./routes/authentication');
var gameRoutes           = require('./routes/game');
var searchRoutes         = require('./routes/search');

var connectionString = config.mongo.url || MongoUtils.getConnectionString(config.mongo);
debug('Connecting to database at ', connectionString);
mongoose.connect(connectionString);
mongoose.set('debug', process.env.DEBUG_DB);

log.configure(config.log4js);

var errorLogger = log.getLogger('server-error');

var app = express();

var server = http.createServer(app);

app.set('env', config.app.environment);

// view engine setup
app.engine('hbs', hbs.express4({
	defaultLayout: path.join(config.paths.templates, 'layout.hbs'),
	partialsDir: path.join(config.paths.templates, 'partials'),
}));

hbs.registerHelper(require(path.join(config.paths.static, "hbs-helpers"))(hbs.handlebars));

app.set('views', config.paths.templates);
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(
	logger(
		config.app.logging.format || 'combined',
		{
			stream: fs.createWriteStream(path.join(config.paths.logs, 'access.log'), {flags: 'a'})
		}
	)
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.app.secret));

app.use(session.instance);
app.use('/static', express.static(path.join(__dirname, 'public')));

setupPassport(app);

app.use('/', indexRoutes);
app.use('/', authenticationRoutes);
app.use('/game', gameRoutes);
app.use('/search', searchRoutes);

app.locals.IS_DEVELOPMENT = app.get('env') === 'development';

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


app.use(function(err, req, res, next) { // jshint unused: false
	var status = err.status || 500;

	res.status(status);
	res.render('error', {
		message: err.message,
		error: app.locals.IS_DEVELOPMENT ? err : {}
	});

	errorLogger.error(
		JSON.stringify({
			status: status,
			message: err.message,
			stack: err.stack
		})
	);
});

if (config.websockets.inline) {
	debug('Starting websockets app as an inline server');
	require('./apps/socket/app').get(app, server);
}

module.exports = {
	app: app,
	server: server
};
