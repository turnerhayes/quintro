"use strict";

const Promise           = require("bluebird");
const express           = require("express");
const HTTPStatusCodes   = require("http-status-codes");
const bodyParser        = require("body-parser");
const rfr               = require("rfr");
const GamesStore        = rfr("server/persistence/stores/game");
const UsersStore        = rfr("server/persistence/stores/user");
const NotFoundException = rfr("server/persistence/exceptions/not-found");


function prepareGame(game) {
	return game.toFrontendObject();
}

const router = express.Router();

router.route("/:gameName")
	.get(
		(req, res, next) => {
			const { gameName } = req.params;

			GamesStore.getGame({
				name: gameName
			}).then(
				(game) => res.json(prepareGame(game, req))
			).catch(next);
		}
	)
	.post(
		bodyParser.urlencoded({
			extended: true,
			type: "application/x-www-form-urlencoded"
		}),
		bodyParser.json({ type: "application/json" }),
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
						.json(prepareGame(game, req));
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
			).catch(
				(err) => {
					if (NotFoundException.isThisException(err)) {
						next(); // 404
						return;
					}

					next(err);
				}
			);
		}
	);

router.route("")
	.get(
		(req, res, next) => {
			const includeUserGames = !!req.query.includeUserGames;
			const onlyOpenGames = !! req.query.onlyOpenGames;
			let numberOfPlayers = Number(req.query.numberOfPlayers);

			if (numberOfPlayers !== numberOfPlayers) {
				// is NaN
				numberOfPlayers = undefined;
			}

			Promise.resolve(
				req.user || UsersStore.findBySessionID(req.session.id)
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
