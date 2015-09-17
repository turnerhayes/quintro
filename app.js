"use strict";

var express        = require('express');
var path           = require('path');
var favicon        = require('serve-favicon');
var logger         = require('morgan');
var http           = require('http');
var fs             = require('fs');
var cookieParser   = require('cookie-parser');
var bodyParser     = require('body-parser');
var hbs            = require('express-hbs');
var mongoose       = require('mongoose');
var log            = require('log4js');
var pathsConfig    = require('./config/paths');
var appConfig      = require('./config/app');
var mongoConfig    = require('./config/mongo');
var MongoUtils     = require('./lib/mongo-utils');
var setupPassport  = require('./passport-authentication');
var session        = require('./session');

var indexRoutes          = require('./routes/index');
var authenticationRoutes = require('./routes/authentication');
var gameRoutes           = require('./routes/game');
var searchRoutes         = require('./routes/search');

mongoose.connect(MongoUtils.getConnectionString(mongoConfig));
mongoose.set('debug', process.env.DEBUG_DB);

log.configure(path.join(__dirname, 'config', 'log4js.json'));

var errorLogger = log.getLogger('server-error');

var app = express();

app.set('env', appConfig.environment);

// view engine setup
app.engine('hbs', hbs.express4({
	defaultLayout: path.join(pathsConfig.templates, 'layout.hbs'),
	partialsDir: path.join(pathsConfig.templates, 'partials'),
}));

hbs.registerHelper(require(path.join(pathsConfig.static, "hbs-helpers"))(hbs.handlebars));

app.set('views', pathsConfig.templates);
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(
	logger(
		appConfig.logging.format || 'combined',
		{
			stream: fs.createWriteStream(path.join(pathsConfig.logs, 'access.log'), {flags: 'a'})
		}
	)
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(appConfig.secret));

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


app.use(function(err, req, res) {
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


module.exports = app;
