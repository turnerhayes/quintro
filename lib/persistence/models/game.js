"use strict";

var _          = require('lodash');
var mongoose   = require('mongoose');
var GameSchema = require('../schemas/game');

function _getCellMatrix(game) {
	var cell;

	var board = [];

	var row, column;
	var rowArray;

	for (row = 0; row < game.board.height; row++) {
		rowArray = [];
		board.push(rowArray);

		for (column = 0; column < game.board.width; column++) {
			cell = game.getCell(column, row);

			rowArray.push(
				_.isUndefined(cell) ?
					null :
					cell.color
			);
		}
	}

	return board;
}

var GameModel = mongoose.model('Game', GameSchema);

Object.defineProperties(GameModel, {
	COLORS: {
		enumerable: true,
		value: [
			"blue",
			"red",
			"yellow",
			"green",
			"white",
			"black",
		],
	},
});

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
	},

	fillCell: {
		enumerable: true,
		value: function(args) {
			var game = this;

			game.board.filled.push({
				position: args.position,
				color   : args.color,
			});
		}
	},

	cellIsFilled: {
		enumerable: true,
		value: function(args) {
			return !_.isUndefined(
				this.getCell(args.column, args.row)
			);
		}
	},

	getCell: {
		enumerable: true,
		value: function(column, row) {
			var game = this;

			return _.find(game.board.filled, function(filledCell) {
				return filledCell.position[0] === column &&
					filledCell.position[1] === row;
			});
		}
	},

	toFrontendObject: {
		enumerable: true,
		value: function() {
			var game = this;

			var obj = game.toObject({
				virtuals: true,
			});

			delete obj._id;
			delete obj.current_player_color;
			delete obj.board.filled;

			obj.board.structure = _getCellMatrix(game);
			
			return obj;
		}
	},
});

exports = module.exports = GameModel;
