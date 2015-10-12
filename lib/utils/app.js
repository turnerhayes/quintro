"use strict";

var fs = require('fs');

exports = module.exports = {
	logFatalException: function(ex, path, cb) {
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
