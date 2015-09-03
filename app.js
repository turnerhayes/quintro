"use strict";

var express        = require('express');
var path           = require('path');
var favicon        = require('serve-favicon');
var logger         = require('morgan');
var cookieParser   = require('cookie-parser');
var bodyParser     = require('body-parser');
var lessMiddleware = require('less-middleware');
var session        = require('express-session');
var hbs            = require('express-hbs');
var pathsConfig    = require('./config/paths');
var appConfig      = require('./config/app');

var indexRoutes = require('./routes/index');
var userRoutes  = require('./routes/users');

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
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(appConfig.secret));
app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: appConfig.secret
}));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/', indexRoutes);
app.use('/users', userRoutes);

app.locals.IS_DEVELOPMENT = app.get('env') === 'development';

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: app.locals.IS_DEVELOPMENT ? err : {}
	});
});


module.exports = app;
