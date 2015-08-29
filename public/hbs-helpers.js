"use strict";

var hbs = require('express-hbs');

module.exports = function(Handlebars) {
	return {
		"Times": function(num, options) {
			var i;
			var result;
			var data;

			if (options.data) {
				debugger;
				data = Handlebars.createFrame(options.data);
			}

			num = parseInt(num);

			if (num !== num || num < 0) {
				num = 0;
			}

			if (num === 0) {
				return options.inverse ?
					new Handlebars.SafeString(options.inverse(this)) :
					new Handlebars.SafeString('');
			}

			result = '';

			for(i = 0; i < num; i++) {
				if (data) {
					data.index = i;
				}

				result += options.fn(this, { data: data });
			}

			return new Handlebars.SafeString(result);
		}
	}
};
