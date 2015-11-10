"use strict";

var debug = require('debug')('quintro:build');

if (process.env.IS_HEROKU) {
	debug('Running setup for Heroku');
	require('./heroku-setup');
}

var appUtils = require('./lib/utils/app');

appUtils.configFilesToEnvironment();

var _                    = require('lodash');
var path                 = require('path');
var fs                   = require('fs');
var dirRecurse           = require('recursive-readdir');
var Q                    = require('q');

var gulp                 = require('gulp');
var jshint               = require('gulp-jshint');
var gutil                = require('gulp-util');
var sourcemaps           = require('gulp-sourcemaps');
var rename               = require('gulp-rename');
var less                 = require('gulp-less');
var uglify               = require('gulp-uglify');
var runSequence          = require('run-sequence');

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

var thirdPartyJS = [path.join(config.paths.static, 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.js')];

var browserifyOptions = _.extend({}, watchify.args, {
	debug: true,
	extensions: ['.es6', '.js', '.json']
});

var hbsfyOptions = {
	extensions: ['hbs'],
	precompiler: 'handlebars'
};

var babelifyOptions = {
	sourceRoot: path.join(config.paths.static, 'javascripts'),
	modules: 'umd',
	extensions: ['.es6'],
};

var partialsDirectory = path.join(config.paths.templates, 'partials');

var jsDirectory = path.join(config.paths.static, 'javascripts');

var hbsSuffixRegex = /\.hbs$/;

var partialsFile = path.join(jsDirectory, 'partials.js');

/**
 * This function generates the partials.js file which is included by the Handlebars client-side
 * init function and read by browserify into a map of partial name to function. Without this,
 * any templates used client-side will not be able to use any partials.
 *
 * @returns Promise that resolves when the file has been written, or rejects if any error occurred
 * in generating it.
 */
function _writePartialsFile() {
	var deferred = Q.defer();

	dirRecurse(partialsDirectory, function(err, files) {
		if (err) {
			deferred.reject(new Error('Error generating Handlebars partials object: ' + err));
		}

		var partialsFileText = "module.exports = {\n" + _.reduce(
			files,
			function(str, file) {
				if (!hbsSuffixRegex.test(file)) {
					return str;
				}

				var partialName = path.relative(partialsDirectory, file).replace(hbsSuffixRegex, '');

				var partialPath = path.relative(jsDirectory, file);

				if (str) {
					str += ",\n";
				}

				str += "\t" + JSON.stringify(partialName) + ": require(" + JSON.stringify(partialPath) + ")";

				return str;
			},
			""
		) + "\n}";

		return Q.nfcall(
			fs.writeFile,
			partialsFile,
			partialsFileText,
			{
				encoding: "utf8"
			}
		).then(
			function() {
				deferred.resolve();
			},
			function(err) {
				deferred.reject(err);
			}
		);
	});

	return deferred.promise;
}

function _getLintStream(files) {
	var jsFilesPattern = path.join(config.paths.static, 'javascripts/**/*.{js,es6}');

	return gulp.src(files || [jsFilesPattern])
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
}

function _compileScripts(bundler, changedFiles) {
	if (_.size(changedFiles) > 0) {
		gutil.log('Recompiling scripts due to changes in the following files:\n\t' + 
			_.map(
				changedFiles,
				function(file) {
					return path.relative(__dirname, file);
				}
			)
		);
	}

	changedFiles = _.filter(
		changedFiles,
		function(file) {
			// Don't lint template files
			return !hbsSuffixRegex.test(file) && file !== partialsFile;
		}
	);

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
		.pipe(uglify())
		.pipe(sourcemaps.write('.')) // writes .map file
		.pipe(gulp.dest(path.join(config.paths.static, 'dist', 'js/')));

	return merge(
		_getLintStream(changedFiles),
		compileStream
	);
}

function _scriptsTask(watch) {
	var bundler = browserify([path.join(config.paths.static, 'javascripts', 'main.es6')].concat(thirdPartyJS), browserifyOptions);
	
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

gulp.task('write-partials', function() {
	return _writePartialsFile();
});

gulp.task('watch-partials', function() {
	gulp.watch(partialsDirectory + '/**/*.hbs', ['write-partials']);
});

gulp.task('lint', function() {
	return _getLintStream();
});

gulp.task('styles', function() {
	return gulp.src(path.join(config.paths.static, 'stylesheets', 'main.less'))
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
		.pipe(gulp.dest(path.join(config.paths.static, 'dist', 'css/')));
});

gulp.task('watch-styles', function() {
	gulp.watch(path.join(config.paths.static, 'stylesheets/**/*.less'), ['styles']);
});

gulp.task('scripts-and-templates', function() {
	return runSequence(
		'write-partials',
		'scripts'
	);
});

gulp.task('watch-scripts-and-templates', function() {
	return runSequence(
		'watch-partials',
		'watch-scripts'
	);
});

gulp.task('static', ['styles', 'scripts-and-templates']);

gulp.task('watch-static', ['watch-styles', 'watch-scripts-and-templates']);

gulp.task('build', ['static']);
