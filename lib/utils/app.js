"use strict";

var fs     = require('fs');
var config = require('./config-manager');

exports = module.exports = {
	logFatalException: function(ex, path, cb) {
		if (config.app.logging.useConsole) {
			throw ex;
		}
		
		fs.appendFile(
			path,
			"\n" + JSON.stringify(
				{
					time: new Date().toString(),
					message: ex.message,
					stack: ex.stack
				},
				null,
				'\t'
			),
			{
				encoding: 'utf8'
			},
			cb
		);
	}
};
