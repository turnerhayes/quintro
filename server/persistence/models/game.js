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
				return val === null || _.find(this.players, {color: val}) !== undefined;
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
	playerLimit: {
		type: Number,
		required: true,
		min: Config.game.players.min,
		max: Config.game.players.max
	},
	isStarted: {
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
			_id: false
		}
	],
	currentPlayerColor: {
		type: String,
	},
});

GameSchema.virtual("currentPlayer").get(
	function() {
		return _.find(
			this.players,
			{
				color: this.currentPlayerColor
			}
		);
	}
).set(
	function(player) {
		if (player === undefined) {
			return;
		}

		this.currentPlayerColor = player.color;
	}
);

GameSchema.virtual("isOver").get(
	function() {
		return !!this.winner;
	}
);

GameSchema.virtual("isFull").get(
	function() {
		return this.players.length === this.playerLimit;
	}
);

GameSchema.pre("validate", function(next) {
	if (_.size(this.players) > this.playerLimit) {
		next(new Error(`Too many players in this game; only up to ${this.playerLimit} allowed`));
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
	if (!this.currentPlayerColor && this.players.length === 1) {
		this.currentPlayerColor = this.players[0].color;
	}

	next();
});




class Game {
	start() {
		this.isStarted = true;
		this.currentPlayer = this.players[0];
		return this.save();
	}

	nextPlayer() {
		this.currentPlayer = this.players[
			(
				this.players.indexOf(
					this.currentPlayer
				) + 1
			) % this.players.length
		];
	}

	fillCell({ position, color }) {
		this.board.filled.push({
			position,
			color
		});
	}

	cellIsFilled([column, row]) {
		return this.getCell([column, row]) !== undefined;
	}

	getCell([column, row]) {
		return this.board.filled.find(
			(filledCell) => filledCell.position[0] === column &&
				filledCell.position[1] === row
		);
	}

	toFrontendObject() {
		const obj = this.toObject({
			virtuals: true,
		});

		delete obj._id;
		delete obj.currentPlayer;

		obj.players = this.players.map(
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
