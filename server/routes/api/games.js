"use strict";

const Promise           = require("bluebird");
const express           = require("express");
const HTTPStatusCodes   = require("http-status-codes");
const bodyParsers       = require("./body-parsers");
const rfr               = require("rfr");
const GamesStore        = rfr("server/persistence/stores/game");
const UsersStore        = rfr("server/persistence/stores/user");
const NotFoundException = rfr("server/persistence/exceptions/not-found");


function prepareGame(game) {
	return game.toFrontendObject();
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

			GamesStore.getGame({
				name: gameName
			}).then(
				(game) => res.json(prepareGame(game))
			).catch(processError.bind(null, next, gameName));
		}
	)
	.post(
		...bodyParsers,
		(req, res, next) => {
			const { width, height, playerLimit } = req.body;
			const { gameName } = req.params;

			GamesStore.createGame({
				name: gameName,
				width,
				height,
				player_limit: playerLimit
			}).then(
				(game) => {
					res.status(HTTPStatusCodes.CREATED)
						.set("Location", `${req.baseUrl}/${game.name}`)
						.json(prepareGame(game));
				}
			).catch(next);
		}
	).head(
		(req, res, next) => {
			const { gameName } = req.params;

			GamesStore.getGame({
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

			if (numberOfPlayers !== numberOfPlayers) {
				// is NaN
				numberOfPlayers = undefined;
			}

			Promise.resolve(
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
				(games) => res.json(games.map(prepareGame))
			).catch(next);
		}
	);

exports = module.exports = router;
