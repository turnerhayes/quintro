"use strict";

const _                 = require("lodash");
const assert            = require("assert");
const Promise           = require("bluebird");
const mongoose          = require("mongoose");
const GameModel         = require("../models/game");
const UserModel         = require("../models/user");
const NotFoundException = require("../exceptions/not-found");

function _createGameName() {
	return Date.now();
}

class GamesStore {
	static saveGameState(gameModel) {
		return Promise.resolve(gameModel.save());
	}

	static getGame({ id, name, populate = true } = {}) {
		let filter = {};

		if (!_.isUndefined(name)) {
			filter.name = name;
		}
		else {
			filter._id = id;
		}

		let promise = GameModel.findOne(filter, {__v: false});

		if (populate) {
			promise = promise.populate("players.user");
		}


		return Promise.resolve(
			promise
		).then(
			function(game) {
				if (game) {
					return game;
				}
				else {
					throw new NotFoundException(`Game with ${name ? "name" : "id"} "${name || id}" not found`);
				}
			}
		);
	}

	static createGame({ name, playerLimit, width, height } = {}) {
		name = name || _createGameName();

		let newGameModel = new GameModel({
			name,
			playerLimit,
			board: {
				width,
				height,
			},
		});

		return Promise.resolve(
			newGameModel.save().then(
				function(model) {
					delete model.__v;

					return model;
				}
			)
		);
	}

	static addPlayerToGame({ player, gameName }) {
		assert(gameName, "Must pass a `gameName` to `addPlayerToGame`");
		assert(player, "Must pass a `player` parameter to `addPlayerToGame`");
		assert(player.color, "`player` parameter for `addPlayerToGame` must have a `color` property");
		assert(
			player.user &&
				(player.user instanceof UserModel),
			"`player` parameter for `addPlayerToGame` must have a `user` property that is a UserModel instance"
		);

		return GamesStore.getGame({
			name: gameName
		}).then(
			(game) => {
				game.players.push(player);

				return game.save();
			}
		);
	}

	static findGames({ numberOfPlayers, onlyOpenGames, excludeUserID, forUserID } = {}) {
		assert(!(excludeUserID && forUserID), "Cannot pass both `excludeUserID` and `forUserID` to `GamesStore.findGames()`");
		let filters = {};

		if (numberOfPlayers > 0) {
			filters.playerLimit = numberOfPlayers;
		}

		if (excludeUserID) {
			filters["players.user"] = {
				$ne: new mongoose.Types.ObjectId(excludeUserID)
			};
		}
		else if (forUserID) {
			filters["players.user"] = new mongoose.Types.ObjectId(forUserID);
		}

		if (onlyOpenGames) {
			Object.assign(
				filters,
				{
					is_started: {
						$ne: true
					},
					winner: null
				}
			);
		}

		let query = GameModel.find(filters, {__v: false});

		if (onlyOpenGames) {
			query = query.$where("this.players.length < this.playerLimit");
		}

		return Promise.resolve(query.populate("players.user"));
	}

	static replacePlayerUsers({ userIDToReplace, userIDToReplaceWith }) {
		assert(userIDToReplace, "`replacePlayerUsers()` requires a `userIDToReplace` parameter");
		assert(userIDToReplaceWith, "`replacePlayerUsers()` requires a `userIDToReplaceWith` parameter");

		return GameModel.updateMany(
			{
				"players.user": userIDToReplace
			},
			{
				$set: {
					"players.$.user": userIDToReplaceWith
				}
			}
		);
	}
}

exports = module.exports = GamesStore;
