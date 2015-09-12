"use strict";

var mongoose = require('mongoose');
var _        = require('lodash');

function _generateNewBoard(width, height) {
	return _.reduce(
		_.range(0, height),
		function(boardArray) {
			var row = [];
			var i;

			for (i = 0; i < width; i++) {
				row[i] = null;
			}

			boardArray.push(row);

			return boardArray;
		},
		[]
	);
}

var GameSchema = new mongoose.Schema({
	short_id: {
		type: String,
		required: true,
		unique: true,
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
		structure: {
			type: mongoose.Schema.Types.Mixed,
		}
	},
	players: {
		type: [String],
	},
	current_player: {
		type: String,
	},
});

GameSchema.pre('save', function(next) {
	if (!(this.board.structure && this.board.structure.length > 0)) {
		this.board.structure = _generateNewBoard(this.board.width, this.board.height);
	}

	if (this.current_player === void 0) {
		this.current_player = (this.players || [undefined])[0];
	}

	next();
});

exports = module.exports = GameSchema;
