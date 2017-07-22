"use strict";

const _                 = require("lodash");
const assert            = require("assert");
const Promise           = require("bluebird");
const mongoose          = require("mongoose");
const rfr               = require("rfr");
const GameModel         = rfr("server/persistence/models/game");
const UserModel         = rfr("server/persistence/models/user");
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

	static findGames({ numberOfPlayers, onlyOpenGames, excludeUser, forUser } = {}) {
		assert(!(excludeUser && forUser), "Cannot pass both `excludeUser` and `forUser` to `GamesStore.findGames()`");
		let filters = {};

		if (numberOfPlayers > 0) {
			filters.player_limit = numberOfPlayers;
		}

		if (excludeUser) {
			assert(
				(excludeUser.user && excludeUser.user) || excludeUser.sessionID,
				"`excludeUser` must contain either a `user` field or a `sessionID` field (or both)"
			);

			const userExclusionFilter = excludeUser.user ?
				{
					"players.user": {
						$ne: new mongoose.Types.ObjectId(excludeUser.user.id)
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

		if (forUser) {
			assert(
				(forUser.user && forUser.user) || forUser.sessionID,
				"`forUser` must contain either a `user` field or a `sessionID` field (or both)"
			);

			const userInclusionFilter = forUser.user ?
				{
					"players.user": new mongoose.Types.ObjectId(forUser.user.id)
				} :
				undefined;

			const sessionIDInclusionFilter = forUser.sessionID ?
				{
					"players.sessionID": forUser.sessionID
				} :
				undefined;

			let filter;

			if (userInclusionFilter && sessionIDInclusionFilter) {
				filter = {
					$or: [
						userInclusionFilter,
						sessionIDInclusionFilter
					]
				};	
			}
			else {
				filter = userInclusionFilter || sessionIDInclusionFilter;
			}

			Object.assign(filters, filter);
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
			query = query.$where("this.players.length < this.player_limit");
		}

		return Promise.resolve(query.populate("players.user"));
	}
}

exports = module.exports = GamesStore;
