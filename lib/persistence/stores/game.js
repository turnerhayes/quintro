"use strict";

var _         = require('lodash');
var Q         = require('q');
var GameModel = require('../models/game');

var __gameCache = {};

function _createShortId() {
	return Date.now();
}

var GameStore = Object.create(Object.prototype, {
	saveGameState: {
		enumerable: true,
		value: function(gameModel) {
			return Q(gameModel.save());
		}
	},

	getGame: {
		enumerable: true,
		value: function(options) {
			options = options || {};

			var filter = {};

			if (!_.isUndefined(options.short_id)) {
				if (!_.isUndefined(__gameCache[options.short_id])) {
					return Q(__gameCache[options.short_id]);
				}

				filter.short_id = options.short_id;
			}
			else {
				filter._id = options.id;
			}


			return Q(
				GameModel.findOne(filter, {__v: false})
			).then(
				function(game) {
					if (game) {
						// __gameCache[game.short_id] = game;

						return game;
					}
				}
			);
		}
	},

	createGame: {
		enumerable: true,
		value: function(options) {
			options = options || {};

			var short_id = options.short_id || _createShortId();

			var newGameModel = new GameModel({
				short_id: short_id,
				board: {
					width: options.width,
					height: options.height,
				},
			});

			console.log('creating game ', newGameModel);

			return Q(
				newGameModel.save().then(
					function(model) {
						delete model.__v;

						return model;
					}
				)
			);
		}
	}
});

exports = module.exports = GameStore;
