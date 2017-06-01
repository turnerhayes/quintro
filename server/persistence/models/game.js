"use strict";

const _          = require("lodash");
const mongoose   = require("mongoose");

const GameSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	winner: {
		type: String,
		validate: {
			validator: function(val) {
				return _.isNull(val) || !_.isUndefined(_.find(this.players, {color: val}));
			},
			message: "\"{VALUE}\" is not one of this game's players' colors."
		}
	},
	board: {
		width: {
			type: Number,
			required: true,
			// min: 15,
			max: 25,
		},
		height: {
			type: Number,
			required: true,
			// min: 15,
			max: 25,
		},
		filled: [
			{
				position: {
					type: Array
				},
				color: {
					type: String
				},
				_id: false
			}
		]
	},
	player_limit: {
		type: Number,
		required: true,
		min: 2,
		max: 6
	},
	is_started: {
		type: Boolean,
		required: true,
		default: false
	},
	players: [
		{
			color: {
				type: String,
			},
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			_id: false
		}
	],
	current_player_color: {
		type: String,
	},
});

GameSchema.virtual("current_player").get(
	function() {
		return _.find(
			this.players,
			{
				color: this.current_player_color
			}
		);
	}
).set(
	function(player) {
		if (_.isUndefined(player)) {
			return;
		}

		this.current_player_color = player.color;
	}
);

GameSchema.virtual("is_over").get(
	function() {
		return !!this.winner;
	}
);

GameSchema.pre("validate", function(next) {
	if (_.size(this.players) > this.player_limit) {
		next(new Error(`Too many players in this game; only up to ${this.player_limit} allowed`));
		return;
	}

	next();
});

GameSchema.pre("save", function(next) {
	if (!this.current_player_color && this.players.length === 1) {
		this.current_player_color = this.players[0].color;
	}

	next();
});



function _findHorizontalCells(args) {
	const startCell = args.startCell;
	let cells = [startCell];

	const rowCells = args.rowCells || _.filter(
		args.colorCells,
		function(cell) {
			return cell.position[1] === startCell.position[1];
		}
	);

	let leftCell, rightCell;

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
			(cell) => {
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
	const startCell = args.startCell;
	let cells = [startCell];

	const columnCells = args.columnCells || _.filter(
		args.colorCells,
		function(cell) {
			return cell.position[0] === startCell.position[0];
		}
	);

	let upCell, downCell;

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
	const startCell = args.startCell;
	let cells = [startCell];

	let upCell, downCell;

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
	const startCell = args.startCell;
	let cells = [startCell];

	let upCell, downCell;

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

class Game {
	getQuintros(startCell) {
		const colorCells = _.where(
			this.board.filled,
			{ color: startCell.color }
		);

		const quintros = {};

		const horizontalCells = _findHorizontalCells({
			model: this,
			colorCells: colorCells,
			startCell: startCell
		});

		const verticalCells = _findVerticalCells({
			model: this,
			colorCells: colorCells,
			startCell: startCell
		});

		const topLeftCells = _findTopLeftDiagonalCells({
			model: this,
			colorCells: colorCells,
			startCell: startCell
		});

		const topRightCells = _findTopRightDiagonalCells({
			model: this,
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

	nextPlayer() {
		this.current_player = this.players[
			(
				_.indexOf(
					this.players,
					this.current_player
				) + 1
			) % _.size(this.players)
		];
	}

	fillCell(args) {
		this.board.filled.push({
			position: args.position,
			color   : args.color,
		});

		const quintros = this.getQuintros(args);

		return {
			quintros: _.isEmpty(quintros) ?
				false :
				quintros
		};
	}

	cellIsFilled({ column, row }) {
		return !_.isUndefined(
			this.getCell(column, row)
		);
	}

	getCell(column, row) {
		return _.find(this.board.filled, (filledCell) => {
			return filledCell.position[0] === column &&
				filledCell.position[1] === row;
		});
	}

	toFrontendObject() {
		const obj = this.toObject({
			virtuals: true,
		});

		delete obj._id;
		delete obj.current_player;

		_.each(
			obj.players,
			function(player) {
				if (_.isFunction(player.user.toFrontendObject)) {
					player.user = player.user.toFrontendObject();
				}
			}
		);

		return obj;
	}
}

GameSchema.loadClass(Game);

const GameModel = mongoose.model("Game", GameSchema);

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

exports = module.exports = GameModel;
