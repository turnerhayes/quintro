"use strict";

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

var hbsHelpers = require(path.join(config.paths.static, 'hbs-helpers'))(require("hbsfy/runtime"));

var thirdPartyJS = ['./public/node_modules/bootstrap/dist/js/bootstrap.js'];

var browserifyOptions = _.extend({}, watchify.args, {
	debug: true,
	extensions: ['.es6', '.js', '.json']
});

var hbsfyOptions = {
	// "precompilerOptions": {
	// 	"knownHelpers": _.reduce(
	// 		helperNames,
	// 		function(helpersObj, helperName) {
	// 			helpersObj[helperName] = true;

	// 			return helpersObj;
	// 		},
	// 		{}
	// 	)
	// }
};

var babelifyOptions = {
	sourceRoot: path.join(config.paths.static, 'javascripts'),
	modules: 'umd',
	extensions: ['.es6'],
};

gulp.task('scripts', function() {
	return gulp.src('./public/javascripts/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat('build.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/dist/js/'));
});

gulp.task('watch-scripts', function() {
	var mainJSFile = "./public/javascripts/main.es6";
	var bundler = watchify(browserify([mainJSFile].concat(thirdPartyJS), browserifyOptions));
	
	bundler.transform(babelify.configure(babelifyOptions));

	bundler.transform(hbsfy.configure(hbsfyOptions));

	function scripts(changedFiles) {
		var filesPattern = './public/javascripts/**/*.{js,es6}';

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

		var lintStream = gulp.src(changedFiles || [filesPattern])
			.pipe(jshint())
			.pipe(jshint.reporter(stylish));

		return merge(lintStream, compileStream);
	}

	bundler.on('update', scripts);

	return scripts();
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

gulp.task('watch-static', ['watch-styles', 'watch-scripts']);
