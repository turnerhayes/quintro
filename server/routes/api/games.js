"use strict";

const _               = require("lodash");
const express         = require("express");
const HTTPStatusCodes = require("http-status-codes");
const bodyParser      = require("body-parser");
const rfr             = require("rfr");
const GamesStore      = rfr("server/persistence/stores/game");


function prepareGame(game, req) {
	const gameObj = game.toFrontendObject({
		keepSessionID: true
	});

	if (req) {
		gameObj.players.forEach(
			(player) => {
				player.isMe = (
					player.user && req.user ?
						req.user.username === player.user.username :
						req.session.id === player.sessionID
				);

				delete player.sessionID;
			}
		);
	}

	return gameObj;
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
	);

router.route("")
	.get(
		(req, res, next) => {
			let numberOfPlayers = Number(req.query.numberOfPlayers);

			if (_.isNaN(numberOfPlayers)) {
				numberOfPlayers = undefined;
			}

			GamesStore.findGames({
				numberOfPlayers,
				excludeUser: {
					user: req.user,
					sessionID: req.session.id
				}
			}).then(
				(games) => res.json(games)
			).catch(next);
		}
	);

exports = module.exports = router;
