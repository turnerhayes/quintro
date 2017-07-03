"use strict";

const _                 = require("lodash");
const Promise           = require("bluebird");
const mongoose          = require("mongoose");
const rfr               = require("rfr");
const GameModel         = rfr("server/persistence/models/game");
const NotFoundException = rfr("server/persistence/exceptions/not-found");

let __gameCache = {};

function _createGameName() {
	return Date.now();
}

class GamesStore {
	static saveGameState(gameModel) {
		return Promise.resolve(gameModel.save());
	}

	static getGame({ id, name } = {}) {
		let filter = {};

		if (!_.isUndefined(name)) {
			if (!_.isUndefined(__gameCache[name])) {
				return Promise.resolve(__gameCache[name]);
			}

			filter.name = name;
		}
		else {
			filter._id = id;
		}


		return Promise.resolve(
			GameModel.findOne(filter, {__v: false}).populate("players.user")
		).then(
			function(game) {
				if (game) {
					// __gameCache[game.name] = game;

					return game;
				}
				else {
					throw new NotFoundException(`Game with ${name ? "name" : "id"} "${name || id}" not found`);
				}
			}
		);
	}

	static createGame({ name, current_player, player_limit, width, height } = {}) {
		name = name || _createGameName();

		let newGameModel = new GameModel({
			name,
			current_player,
			player_limit,
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

	static findGames({ numberOfPlayers, excludeUser } = {}) {
		let filters = {
			is_started: {
				$ne: true
			},
			winner: null
		};

		if (numberOfPlayers > 0) {
			filters.player_limit = numberOfPlayers;
		}

		if (excludeUser) {
			const userExclusionFilter = excludeUser.user ?
				{
					"players.user": {
						$ne: {
							_id: new mongoose.Types.ObjectId(excludeUser.user.id)
						}
					}
				} :
				undefined;

			const sessionIDExclusionFilter = excludeUser.sessionID ?
				{
					"players.sessionID": {
						$ne: excludeUser.sessionID
					}
				} :
				undefined;

			
			Object.assign(filters, userExclusionFilter, sessionIDExclusionFilter);
		}

		let query = GameModel.find(filters, {__v: false});

		query = query.$where("this.players.length < this.player_limit");

		return Promise.resolve(query.populate("players.user"));
	}
}

exports = module.exports = GamesStore;
