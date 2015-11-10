"use strict";

var _        = require('lodash');
var mongoose = require('mongoose');


var GameSchema = new mongoose.Schema({
	short_id: {
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
		"default": false
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

GameSchema.virtual('is_over').get(
	function() {
		return !!this.winner;
	}
);

GameSchema.pre('validate', function(next) {
	if (_.size(this.players) > this.player_limit) {
		next(new Error('Too many players in this game; only up to ' + this.player_limit + ' allowed'));
		return;
	}

	next();
});

GameSchema.pre('save', function(next) {
	if (!this.current_player_color && this.players.length === 1) {
		this.current_player_color = this.players[0].color;
	}

	next();
});

exports = module.exports = GameSchema;
