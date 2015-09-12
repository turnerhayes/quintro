"use strict";

var express = require('express');
var router = express.Router();

router.route('/')
	.get(
		function(req, res, next) {
			res.render('index', { title: 'Quintro!', width: 20, height: 20, req: req });
		}
);

module.exports = router;
