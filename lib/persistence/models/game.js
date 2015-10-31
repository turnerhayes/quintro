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


function _findHorizontalCells(args) {
	var startCell = args.startCell;
	var cells = [startCell];

	var rowCells = args.rowCells || _.filter(
		args.colorCells,
		function(cell) {
			return cell.position[1] === startCell.position[1];
		}
	);

	var leftCell, rightCell;

	if (args.left !== false && startCell.position[0] > 0) {
		leftCell = _.find(
			rowCells,
			function(cell) {
				return cell.position[0] === startCell.position[0] - 1;
			}
		);

		if (!_.isUndefined(leftCell)) {
			cells = _findHorizontalCells(
				_.extend(
					{},
					args,
					{
						startCell: leftCell,
						right: false,
						rowCells: rowCells
					}
				)
			).concat(cells);
		}
	}

	if (args.right !== false && startCell.position[0] < args.model.board.width - 1) {
		rightCell = _.find(
			rowCells,
			function(cell) {
				return cell.position[0] === startCell.position[0] + 1;
			}
		);

		if (!_.isUndefined(rightCell)) {
			cells = cells.concat(
				_findHorizontalCells(
					_.extend(
						{},
						args,
						{
							startCell: rightCell,
							left: false,
							rowCells: rowCells
						}
					)
				)
			);
		}
	}

	return cells;
}

function _findVerticalCells(args) {
	var startCell = args.startCell;
	var cells = [startCell];

	var columnCells = args.columnCells || _.filter(
		args.colorCells,
		function(cell) {
			return cell.position[0] === startCell.position[0];
		}
	);

	var upCell, downCell;

	if (args.up !== false && startCell.position[1] > 0) {
		upCell = _.find(
			columnCells,
			function(cell) {
				return cell.position[1] === startCell.position[1] - 1;
			}
		);

		if (!_.isUndefined(upCell)) {
			cells = _findVerticalCells(
				_.extend(
					{},
					args,
					{
						startCell: upCell,
						down: false,
						columnCells: columnCells
					}
				)
			).concat(cells);
		}
	}

	if (args.down !== false && startCell.position[1] < args.model.board.height - 1) {
		downCell = _.find(
			columnCells,
			function(cell) {
				return cell.position[1] === startCell.position[1] + 1;
			}
		);

		if (!_.isUndefined(downCell)) {
			cells = cells.concat(
				_findVerticalCells(
					_.extend(
						{},
						args,
						{
							startCell: downCell,
							up: false,
							columnCells: columnCells
						}
					)
				)
			);
		}
	}

	return cells;
}

function _findTopLeftDiagonalCells(args) {
	var startCell = args.startCell;
	var cells = [startCell];

	var upCell, downCell;

	if (args.up !== false && startCell.position[1] > 0 && startCell.position[0] > 0) {
		upCell = _.find(
			args.colorCells,
			function(cell) {
				return cell.position[0] === startCell.position[0] - 1 &&
					cell.position[1] === startCell.position[1] - 1;
			}
		);

		if (!_.isUndefined(upCell)) {
			cells = _findTopLeftDiagonalCells(
				_.extend(
					{},
					args,
					{
						startCell: upCell,
						down: false
					}
				)
			).concat(cells);
		}
	}

	if (
		args.down !== false &&
		startCell.position[0] < args.model.board.width - 1 &&
		startCell.position[1] < args.model.board.height - 1
	) {
		downCell = _.find(
			args.colorCells,
			function(cell) {
				return cell.position[0] === startCell.position[0] + 1 &&
					cell.position[1] === startCell.position[1] + 1;
			}
		);

		if (!_.isUndefined(downCell)) {
			cells = cells.concat(
				_findTopLeftDiagonalCells(
					_.extend(
						{},
						args,
						{
							startCell: downCell,
							up: false
						}
					)
				)
			);
		}
	}

	return cells;
}

function _findTopRightDiagonalCells(args) {
	var startCell = args.startCell;
	var cells = [startCell];

	var upCell, downCell;

	if (
		args.up !== false &&
		startCell.position[1] > 0 &&
		startCell.position[0] < args.model.board.width - 1
	) {
		upCell = _.find(
			args.colorCells,
			function(cell) {
				return cell.position[0] === startCell.position[0] + 1 &&
					cell.position[1] === startCell.position[1] - 1;
			}
		);

		if (!_.isUndefined(upCell)) {
			cells = _findTopRightDiagonalCells(
				_.extend(
					{},
					args,
					{
						startCell: upCell,
						down: false
					}
				)
			).concat(cells);
		}
	}

	if (
		args.down !== false &&
		startCell.position[0] > 0 &&
		startCell.position[1] < args.model.board.height - 1
	) {
		downCell = _.find(
			args.colorCells,
			function(cell) {
				return cell.position[0] === startCell.position[0] - 1 &&
					cell.position[1] === startCell.position[1] + 1;
			}
		);

		if (!_.isUndefined(downCell)) {
			cells = cells.concat(
				_findTopRightDiagonalCells(
					_.extend(
						{},
						args,
						{
							startCell: downCell,
							up: false
						}
					)
				)
			);
		}
	}

	return cells;
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
	getQuintros: {
		enumerable: true,
		value: function(startCell) {
			var game = this;

			var colorCells = _.where(
				game.board.filled,
				{ color: startCell.color }
			);

			var quintros = {};

			var horizontalCells = _findHorizontalCells({
				model: game,
				colorCells: colorCells,
				startCell: startCell
			});

			var verticalCells = _findVerticalCells({
				model: game,
				colorCells: colorCells,
				startCell: startCell
			});

			var topLeftCells = _findTopLeftDiagonalCells({
				model: game,
				colorCells: colorCells,
				startCell: startCell
			});

			var topRightCells = _findTopRightDiagonalCells({
				model: game,
				colorCells: colorCells,
				startCell: startCell
			});

			if (_.size(horizontalCells) >= 5) {
				quintros.horizontal = horizontalCells;
			}

			if (_.size(verticalCells) >= 5) {
				quintros.vertical = verticalCells;
			}

			if (_.size(topLeftCells) >= 5) {
				quintros.top_left = topLeftCells;
			}

			if (_.size(topRightCells) >= 5) {
				quintros.top_right = topRightCells;
			}

			return quintros;
		}
	},

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

			var quintros = game.getQuintros(args);

			return {
				quintros: _.isEmpty(quintros) ?
					false :
					quintros
			};
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

			_.each(
				game.players,
				function(player) {
					player.user = player.user.toFrontendObject();
				}
			);

			if (obj.current_player) {
				obj.current_player.user = game.current_player.user.toFrontendObject();
			}

			obj.board.structure = _getCellMatrix(game);
			
			return obj;
		}
	},

});

exports = module.exports = GameModel;
