"use strict";

const _        = require("lodash");
const mongoose = require("mongoose");
const rfr      = require("rfr");
const Board    = rfr("shared-lib/board");

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

GameSchema.pre("validate", function(next) {
	if (_.size(this.players) > this.player_limit) {
		next(new Error(`Too many players in this game; only up to ${this.player_limit} allowed`));
		return;
	}

	for (let i = this.players.length - 1; i >= 0; i--) {
		if (
			(!this.players[i].user && !this.players[i].sessionID) ||
			(this.players[i].user && this.players[i].sessionID)
		) {
			let message = `Every player must either have a user or a sessionID, but not both. Player ${i} has `;

			if (this.players[i].user) {
				message += "both a user and a sessionID";
			}
			else {
				message += "neither a user nor a sessionID";
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

		const quintros = Board.getQuintros({
			game: this,
			startCell: {
				position: args.position,
				color: args.color
			}
		});

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

	toFrontendObject({ keepSessionID = false } = {}) {
		const obj = this.toObject({
			virtuals: true,
		});

		delete obj._id;
		delete obj.current_player;

		_.each(
			obj.players,
			function(player) {
				if (player.user) {
					if (_.isFunction(player.user.toFrontendObject)) {
						player.user = player.user.toFrontendObject();
					}

					player.isAnonymous = false;
				}
				else {
					player.isAnonymous = true;
				}

				if (!keepSessionID) {
					delete player.sessionID;
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
