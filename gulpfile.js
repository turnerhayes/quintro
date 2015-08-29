"use strict";

var _            = require('lodash');
var gulp         = require('gulp');
var jshint       = require('gulp-jshint');
var gutil        = require('gulp-util');
var sourcemaps   = require('gulp-sourcemaps');
var rename       = require('gulp-rename');

var watchify     = require('watchify');
var browserify   = require('browserify');
var hbsfy        = require('hbsfy');
var Handlebars   = require('handlebars');
var source       = require('vinyl-source-stream');
var buffer       = require('vinyl-buffer');
var merge        = require('merge-stream');
var stylish      = require('jshint-stylish');

var less                 = require('gulp-less');
var LessPluginCleanCSS   = require('less-plugin-clean-css');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');

var helperNames = _.keys(require('./public/hbs-helpers')(Handlebars));

var cleancss = new LessPluginCleanCSS({ advanced: true });
var autoprefix = new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

var options = _.extend({}, watchify.args, {
	debug: true
});

gulp.task('watch-scripts', function() {
	var bundler = watchify(browserify('./public/js/main.js', options));

	bundler.transform(
		hbsfy.configure({
			"precompilerOptions": {
				"knownHelpers": _.reduce(
					helperNames,
					function(helpersObj, helperName) {
						helpersObj[helperName] = true;

						return helpersObj;
					},
					{}
				)
			}
		})
	);

	function scripts(changedFiles) {
		var compileStream = bundler
			.bundle()
			.on('error', gutil.log.bind(gutil, gutil.colors.red('Browserify Error\n')))
			.on('log', gutil.log)
			.pipe(source('build.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({
				loadMaps: true // loads map from browserify file
			}))
			.pipe(sourcemaps.write()) // writes .map file
			.pipe(gulp.dest('./public/dist/js/'));

		var lintStream = gulp.src(changedFiles || ['./public/js/**/*.js'])
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
			plugins: [cleancss/*, autoprefix*/]
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
