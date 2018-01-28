"use strict";

const _        = require("lodash");
const mongoose = require("mongoose");
const Config   = require("../../lib/config");

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
			min: Config.game.board.width.min,
			max: Config.game.board.width.max,
		},
		height: {
			type: Number,
			required: true,
			min: Config.game.board.height.min,
			max: Config.game.board.height.max,
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
		min: Config.game.players.min,
		max: Config.game.players.max
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
				default: null
			},
			sessionID: {
				type: String,
				default: null
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

GameSchema.virtual("isFull").get(
	function() {
		return this.players.length === this.player_limit;
	}
);

GameSchema.pre("validate", function(next) {
	if (_.size(this.players) > this.player_limit) {
		next(new Error(`Too many players in this game; only up to ${this.player_limit} allowed`));
		return;
	}

	for (let i = this.players.length - 1; i >= 0; i--) {
		if (
			(!this.players[i].user.username && !this.players[i].user.sessionID) ||
			(this.players[i].user.username && this.players[i].user.sessionID)
		) {
			let message = `Every player user must either have a username or a sessionID, but not both. Player ${this.players[i].color} has `;

			if (this.players[i].user) {
				message += "both a username and a sessionID";
			}
			else {
				message += "neither a username nor a sessionID";
			}

			next(new Error(message));
			return;
		}
	}

	next();
});

GameSchema.pre("save", function(next) {
	if (!this.current_player_color && this.players.length === 1) {
		this.current_player_color = this.players[0].color;
	}

	next();
});




class Game {
	start() {
		this.is_started = true;
		this.current_player = this.players[0];
		return this.save();
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

	fillCell({ position, color }) {
		this.board.filled.push({
			position,
			color
		});
	}

	cellIsFilled([column, row]) {
		return !_.isUndefined(
			this.getCell([column, row])
		);
	}

	getCell([column, row]) {
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

		obj.players = _.map(
			this.players,
			(player) => {
				const user = player.user.toFrontendObject();

				player = player.toJSON();

				player.user = user;

				return player;
			}
		);

		return obj;
	}
}

GameSchema.loadClass(Game);

const GameModel = mongoose.model("Game", GameSchema);

exports = module.exports = GameModel;
