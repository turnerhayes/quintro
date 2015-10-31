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

					game = game.toFrontendObject();

					var selfPlayer = _.find(
						game.players,
						function(player) {
							return player.user.id === _.get(req.user, 'id');
						}
					);

					if (!_.isUndefined(selfPlayer)) {
						selfPlayer.is_self = true;

						if (_.get(game.current_player, 'user.id') === selfPlayer.user.id) {
							game.current_player.is_self = true;
						}
					}

					res.format({
						json: function() {
							res.json(game);
						},
						html: function() {
							res.render('board-page', {
								title: 'Play Quintro Online! -- ' + game.short_id,
								req: req,
								game: game,
							});
						}
					});
				}
			);
		}
	).post(_createGame);

exports = module.exports = router;
