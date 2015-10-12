"use strict";

var mongoose = require('mongoose');
var _        = require('lodash');


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
	players: [
		{
			color: {
				type: String,
			},
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			_id: false
		}
	],
	current_player_color: {
		type: String,
	},
});

GameSchema.virtual('current_player').get(
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

exports = module.exports = GameSchema;
