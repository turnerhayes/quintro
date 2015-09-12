"use strict";

var express        = require('express');
var path           = require('path');
var favicon        = require('serve-favicon');
var logger         = require('morgan');
var http           = require('http');
var fs             = require('fs');
var cookieParser   = require('cookie-parser');
var bodyParser     = require('body-parser');
var lessMiddleware = require('less-middleware');
var session        = require('express-session');
var MongoStore     = require('connect-mongo')(session);
var hbs            = require('express-hbs');
var mongoose       = require('mongoose');
var log            = require('log4js');
var pathsConfig    = require('./config/paths');
var appConfig      = require('./config/app');
var mongoConfig    = require('./config/mongo');
var SocketManager  = require('./lib/socket-manager');
var setupPassport  = require('./passport-authentication');

var indexRoutes          = require('./routes/index');
var authenticationRoutes = require('./routes/authentication');
var gameRoutes           = require('./routes/game');
var searchRoutes         = require('./routes/search');

mongoose.connect(mongoConfig.connectionString);
mongoose.set('debug', process.env.DEBUG_DB);

log.configure('./config/log4js.json');

var errorLogger = log.getLogger('server-error');

var sessionStore = new MongoStore({
	"host": appConfig.session.store.host,
	"port" : appConfig.session.store.port,
	"db": appConfig.session.store.database,
});

var sessionInstance = session({
	key: appConfig.session.key,
	store: sessionStore,
	secret: appConfig.secret,
	saveUninitialized: true,
	resave: false
});

var app = express();

var server = http.createServer(app);

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

app.use(sessionInstance);
app.use('/static', express.static(path.join(__dirname, 'public')));

setupPassport(app);

SocketManager.initialize({
	server: server,
	session: sessionInstance,
	sessionStore: sessionStore,
});

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


app.use(function(err, req, res, next) {
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


module.exports = {
	app: app,
	server: server,
};
