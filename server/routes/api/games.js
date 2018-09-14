"use strict";

const Promise           = require("bluebird");
const express           = require("express");
const HTTPStatusCodes   = require("http-status-codes");
const bodyParsers       = require("./body-parsers");
const {
	prepareGameForFrontend,
}                       = require("../utils");
const GamesStore        = require("../../persistence/stores/game");
const UsersStore        = require("../../persistence/stores/user");
const NotFoundException = require("../../persistence/exceptions/not-found");


function prepareGame(game, req) {
	return prepareGameForFrontend({ game, request: req });
}

const router = express.Router();

function processError(next, gameName, error) {
	if (NotFoundException.isThisException(error)) {
		error = {
			status: HTTPStatusCodes.NOT_FOUND,
			message: `No game named ${gameName} found`,
			error,
		};
	}

	next(error);
}

router.route("/:gameName")
	.get(
		(req, res, next) => {
			const { gameName } = req.params;

			return GamesStore.getGame({
				name: gameName
			}).then(
				(game) => res.json(prepareGame(game, req))
			).catch(processError.bind(null, next, gameName));
		}
	)
	.post(
		...bodyParsers,
		(req, res, next) => {
			const { width, height, playerLimit } = req.body;
			const { gameName } = req.params;

			return GamesStore.createGame({
				name: gameName,
				width,
				height,
				playerLimit
			}).then(
				(game) => {
					res.status(HTTPStatusCodes.CREATED)
						.set("Location", `${req.baseUrl}/${game.name}`)
						.json(prepareGame(game, req));
				}
			).catch(next);
		}
	).head(
		(req, res, next) => {
			const { gameName } = req.params;

			return GamesStore.getGame({
				name: gameName,
				populate: false
			}).then(
				() => res.end()
			).catch(processError.bind(null, next, gameName));
		}
	);

router.route("/")
	.get(
		(req, res, next) => {
			const includeUserGames = !!req.query.includeUserGames;
			const onlyOpenGames = !!req.query.onlyOpenGames;
			let numberOfPlayers = Number(req.query.numberOfPlayers);

			if (Number.isNaN(numberOfPlayers)) {
				numberOfPlayers = undefined;
			}

			return Promise.resolve(
				req.user || UsersStore.findBySessionID(req.sessionID)
			).then(
				(user) => {
					if (!user && includeUserGames) {
						// We want the current user's games, but have no current user
						// (and no session user for them); return empty array
						return [];
					}

					return GamesStore.findGames({
						numberOfPlayers,
						onlyOpenGames,
						[includeUserGames ? "forUserID" : "excludeUserID"]: user && user.id
					});
				}
			).then(
				(games) => res.json(games.map((game) => prepareGame(game, req)))
			).catch(next);
		}
	);

exports = module.exports = router;
