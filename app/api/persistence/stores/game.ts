import mongoose          from "mongoose";
import {GameModel}         from "../models/game";
import {UserModel}         from "../models/user";
import NotFoundException from "../exceptions/not-found";
import {connect} from "../connection";
import { PlayerUser, ServerQuintroUser } from "@shared/quintro.d";
import { UserStore } from "./user";


type FindGamesArgs = {
	numberOfPlayers?: number;
	onlyOpenGames?: boolean;
	excludeUserID?: string;
	forUserID?: never;
} | {
	numberOfPlayers?: number;
	onlyOpenGames?: boolean;
	excludeUserID?: never;
	forUserID?: string;
}

function _createGameName() {
	return `${Date.now()}`;
}

class GamesStore {
	static async saveGameState(gameModel: mongoose.Document) {
		await connect();
		return await gameModel.save();
	}

	static async getGame({
		id,
		name,
		populate = true,
	}: {
		id?: string;
		name?: string;
		populate?: boolean;
	} = {}) {
		let filter: {
			name?: string;
			_id?: string;
		} = {};

		if (name !== undefined) {
			filter.name = name;
		}
		else {
			filter._id = id;
		}
		await connect();

		let query = GameModel.findOne(filter, {__v: false});

		if (populate) {
			query = GamesStore.populatePlayerUsers(query);
		}

		const game = await query;
		if (game) {
			return game;
		}
		else {
			throw new NotFoundException(`Game with ${name ? "name" : "id"} "${name || id}" not found`);
		}
	}

	static async createGame({
		name,
		playerLimit,
		width,
		height,
	}: {
		name?: string;
		playerLimit?: number;
		width?: number;
		height?: number;
	} = {}) {
		name = name || _createGameName();

		const newGameModel = new GameModel({
			name,
			playerLimit,
			board: {
				width,
				height,
			},
		});

		const model = await newGameModel.save();
		delete model.__v;

		return model;
	}

	static async addPlayerToGame({
		player,
		gameName,
	}: {
		player: {
			color: string;
			user: Partial<ServerQuintroUser>;
		};
		gameName: string;
	}) {
		const game = await GamesStore.getGame({
			name: gameName
		});

		let userModel: mongoose.Document;
		if (player.user.id) {
			userModel = await UserStore.findByID(player.user.id);
		}
		else if (player.user.providerID) {
			userModel = await UserStore.findByProviderID(player.user.provider, player.user.providerID);
		}
		else if (player.user.sessionID) {
			userModel = await UserStore.findBySessionID(player.user.sessionID);
		}
		else {
			throw new Error(`Cannot locate player user; requires either a user ID, a provider/provider ID pair, `)
		}

		(game.players).push({
			color: player.color,
			user: userModel as unknown as ServerQuintroUser,
		});

		return await game.save();
	}

	static async findGames({
		numberOfPlayers,
		onlyOpenGames,
		excludeUserID,
		forUserID,
	}: FindGamesArgs = {}) {
		let filters: {
			playerLimit?: number;
			"players.user"?: mongoose.Types.ObjectId | {
				"$ne": mongoose.Types.ObjectId;
			};
			is_started?: {
				"$ne": true;
			};
			winner?: null;
		} = {};

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
			filters.is_started = {
				$ne: true,
			};
			filters.winner = null;
		}

		let query = GameModel.find(filters, {__v: false});

		if (onlyOpenGames) {
			query = query.$where("this.players.length < this.playerLimit");
		}

		return await GamesStore.populatePlayerUsers(query);
	}

	private static populatePlayerUsers<T extends mongoose.Query<unknown, unknown>>(query: T) {
		return query.populate<{"players.user": PlayerUser}>("players.user") as T;
	}

	static replacePlayerUsers({
		userIDToReplace,
		userIDToReplaceWith,
	}: {
		userIDToReplace: mongoose.Types.ObjectId;
		userIDToReplaceWith: mongoose.Types.ObjectId;
	}) {
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

export {GamesStore};
