"use strict";

var _         = require('lodash');
var express   = require('express');
var GameStore = require('../lib/persistence/stores/game');
var router    = express.Router();

router.route('/')
	.get(
		function(req, res, next) {
			GameStore.findGames({
				short_id_like: req.query.name,
				width: req.query.width,
				height: req.query.height,
				player_count: req.query.player_count,
			}).done(
				function(results) {
					res.render('search', {
						title: 'Search for a game',
						req: req,
						submitted: true,
						results: _.map(
							results,
							function(result) {
								return result.toObject();
							}
						)
					});
				},
				function(err) {
					next(err);
				}
			)

		}
);

module.exports = router;
