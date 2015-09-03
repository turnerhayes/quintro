var express = require('express');
var router = express.Router();

/* GET home page. */
router.route('/')
	.get(
		function(req, res, next) {
			res.render('board-page', { title: 'Quintro!', width: 20, height: 20 });
		}
);

module.exports = router;
