"use strict";

var express   = require('express');
var GameStore = require('../lib/persistence/stores/game');

var router = new express.Router();

function _createGame(req, res) {
	GameStore.createGame({
		short_id: req.params.short_id || req.body.short_id,
		width: req.body.width,
		height: req.body.height,
	}).done(
		function(game) {
			console.log('created game');
			res.status(201);
			res.set('Location', '/game/' + game.short_id);
			res.json(game);
		},
		function(err) {
			console.error('Error creating game: ', err);
			res.status(500);
			res.json({
				error: {
					message: err.message
				}
			});
		}
	);
}

router.route('/')
	.post(_createGame);

router.route('/:short_id')
	.get(
		function(req, res, next) {
			GameStore.getGame({
				short_id: req.params.short_id,
			}).done(
				function(game) {
					if (!game) {
						res.status(404);
						next(new Error('No game found with ID ' + req.params.short_id));
						return;
					}

					res.format({
						json: function() {
							res.json(game);
						},
						html: function() {
							res.render('board-page', { game: game.toObject() });
						}
					})
				}
			);
		}
	).post(_createGame);

exports = module.exports = router;
