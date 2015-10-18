"use strict";

var debug = require('debug')('quintro:build');

if (process.env.IS_HEROKU) {
	debug('Running setup for Heroku');
	require('./heroku-setup');
}

var _                    = require('lodash');
var path                 = require('path');

var gulp                 = require('gulp');
var jshint               = require('gulp-jshint');
var gutil                = require('gulp-util');
var sourcemaps           = require('gulp-sourcemaps');
var rename               = require('gulp-rename');
var babel                = require('gulp-babel');
var concat               = require('gulp-concat');
var less                 = require('gulp-less');

var watchify             = require('watchify');
var browserify           = require('browserify');
var hbsfy                = require('hbsfy');
var babelify             = require('babelify');
var source               = require('vinyl-source-stream');
var buffer               = require('vinyl-buffer');
var merge                = require('merge-stream');
var stylish              = require('jshint-stylish');

var LessPluginCleanCSS   = require('less-plugin-clean-css');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');

var cleancss             = new LessPluginCleanCSS({ advanced: true });
var autoprefix           = new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

var config               = require('./lib/utils/config-manager');

var thirdPartyJS = ['./public/node_modules/bootstrap/dist/js/bootstrap.js'];

var browserifyOptions = _.extend({}, watchify.args, {
	debug: true,
	extensions: ['.es6', '.js', '.json']
});

var hbsfyOptions = {};

var babelifyOptions = {
	sourceRoot: path.join(config.paths.static, 'javascripts'),
	modules: 'umd',
	extensions: ['.es6'],
};

var jsFilesPattern = './public/javascripts/**/*.{js,es6}';

function _getLintStream(files) {
	return gulp.src(files || [jsFilesPattern])
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
}

function _compileScripts(bundler, changedFiles) {
	var compileStream = bundler
		.bundle()
		.on('error', function(err) {
			gutil.log(gutil.colors.red('Browserify Error\n'), err.message, err.stack || '');
		})
		.on('log', gutil.log)
		.pipe(source('build.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true // loads map from browserify file
		}))
		.pipe(sourcemaps.write('.')) // writes .map file
		.pipe(gulp.dest('./public/dist/js/'));

	var lintStream = _getLintStream(changedFiles);

	return merge(lintStream, compileStream);
}

function _scriptsTask(watch) {
	var bundler = browserify(["./public/javascripts/main.es6"].concat(thirdPartyJS), browserifyOptions);
	
	if (watch) {
		bundler = watchify(bundler);
	}
	
	bundler.transform(babelify.configure(babelifyOptions));

	bundler.transform(hbsfy.configure(hbsfyOptions));

	if (watch) {
		bundler.on('update', _.bind(_compileScripts, undefined, bundler));
	}

	return _compileScripts(bundler);
}

gulp.task('scripts', function() {
	return _scriptsTask();
});

gulp.task('watch-scripts', function() {
	return _scriptsTask(true);
});

gulp.task('lint', function() {
	return _getLintStream();
});

gulp.task('styles', function() {
	return gulp.src('./public/stylesheets/main.less')
		.pipe(sourcemaps.init())
		.pipe(less({
			// modifyVars: {
			// 	"@fa-font-path": "../fonts/font-awesome"
			// },
			plugins: [cleancss, autoprefix]
		}))
		.pipe(rename({
			dirname: '',
			basename: 'build',
			extname: '.css'
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/dist/css/'));
});

gulp.task('watch-styles', function() {
	gulp.watch('./public/stylesheets/**/*.less', ['styles']);
});

gulp.task('static', ['styles', 'scripts']);

gulp.task('watch-static', ['watch-styles', 'watch-scripts']);

gulp.task('build', ['static']);
