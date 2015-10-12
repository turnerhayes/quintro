"use strict";

var _         = require('lodash');
var express   = require('express');
var GameStore = require('../lib/persistence/stores/game');

var router = new express.Router();

function _createGame(req, res, next) {
	var players = req.params.players || req.body.players;
	var numberOfPlayers;

	GameStore.createGame({
		short_id: req.params.short_id || req.body.short_id,
		width: req.params.width || req.body.width,
		height: req.params.height || req.body.height,
		players: players,
	}).done(
		function(game) {
			res.status(201);
			res.set('Location', '/game/' + game.short_id);

			res.format({
				html: function() {
					res.redirect(game.short_id);
				},
				json: function() {
					res.json(game.toFrontendObject());
				}
			});
		},
		function(err) {
			res.status(500);
			
			res.format({
				html: function() {
					next(err);
				},
				json: function() {
					res.json({
						error: {
							message: err.message
						}
					});
				}
			});
		}
	);
}

router.route('/')
	.post(_createGame);

router.route('/create')
	.get(
		function(req, res) {
			res.render(
				'create-game',
				{
					title: "Create a game",
					req: req
				}
			);
		}
	).post(_createGame);

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
							res.json(game.toFrontendObject());
						},
						html: function() {
							res.render('board-page', {
								title: 'Play Quintro Online! -- ' + game.short_id,
								req: req,
								game: game.toFrontendObject(),
							});
						}
					});
				}
			);
		}
	).post(_createGame);

exports = module.exports = router;
