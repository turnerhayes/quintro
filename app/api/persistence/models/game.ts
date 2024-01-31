import mongoose from "mongoose";
import {game as GameConfig} from "@shared/config";
import { ServerQuintroUser } from "@shared/quintro.d";
import { ServerGame } from "@shared/game";

const GameSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	winner: {
		type: String,
		validate: {
			validator: function(val: string|null) {
				return val === null || this.players.find(({color}) => color === val) !== undefined;
			},
			message: "\"{VALUE}\" is not one of this game's players' colors."
		}
	},
	board: {
		width: {
			type: Number,
			required: true,
			min: GameConfig.board.width.min,
			max: GameConfig.board.width.max,
		},
		height: {
			type: Number,
			required: true,
			min: GameConfig.board.height.min,
			max: GameConfig.board.height.max,
		},
		filledCells: [
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
		min: GameConfig.players.min,
		max: GameConfig.players.max
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
});

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
	if (this.players.length > this.playerLimit) {
		next(new Error(`Too many players in this game; only up to ${this.playerLimit} allowed`));
		return;
	}

	for (let i = this.players.length - 1; i >= 0; i--) {
		const user = this.players[i].user as unknown as ServerQuintroUser;
		const username = user.username;
		const sessionID = user.sessionID;

		if (
			(!username && !sessionID) ||
			(username && sessionID)
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


class Game extends mongoose.Model<ServerGame> {
	start() {
		this.isStarted = true;
		return this.save();
	}

	getCurrentPlayerColor() {
		if (!this.isStarted) {
			return undefined;
		}

		if (this.board.filledCells.length === 0) {
			return this.players[0].color;
		}

		const lastCell = this.board.filledCells[this.board.filledCells.length - 1];

		return this.players[
			(
				this.players.findIndex(
					(player) => player.color === lastCell.color
				) + 1
			) % this.players.length
		].color;
	}

	fillCell({ position, color }) {
		this.board.filledCells.push({
			position,
			color
		});
	}

	cellIsFilled([column, row]) {
		return this.getCell([column, row]) !== undefined;
	}

	getCell([column, row]) {
		return this.board.filledCells.find(
			(filledCell) => filledCell.position[0] === column &&
				filledCell.position[1] === row
		);
	}

	toFrontendObject() {
		const obj = this.toObject({
			virtuals: true,
		});

		delete obj._id;

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

const GameModel = mongoose.models.Game as mongoose.Model<ServerGame> || mongoose.model<ServerGame>("Game", GameSchema);

export {GameModel};
