"use strict";

var _          = require('lodash');
var mongoose   = require('mongoose');
var GameSchema = require('../schemas/game');

var GameModel = mongoose.model('Game', GameSchema);

Object.defineProperties(GameModel.prototype, {
	nextPlayer: {
		enumerable: true,
		value: function() {
			var game = this;

			game.current_player = game.players[
				(
					_.indexOf(
						game.players,
						game.current_player
					) + 1
				) % _.size(game.players)
			];
		}
	}
});

exports = module.exports = GameModel;
