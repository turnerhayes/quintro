"use strict";

const express                  = require("express");
const HTTPStatusCodes          = require("http-status-codes");
const rfr                      = require("rfr");
const GamesStore               = rfr("server/persistence/stores/game");

const router = express.Router();

router.route("/:gameName")
	.get(
		(req, res, next) => {
			const { gameName } = req.params;

			GamesStore.getGame({
				name: gameName
			}).then(
				(game) => res.json(game.toFrontendObject())
			).catch(err => next(err));
		}
	)
	.post(
		(req, res, next) => {
			const { width, height, playerLimit } = req.body;
			const { name } = req.params;

			GamesStore.createGame({
				name,
				width,
				height,
				player_limit: playerLimit
			}).then(
				(game) => {
					res.status(HTTPStatusCodes.CREATED)
						.set("Location", `${req.baseUrl}/${game.name}`)
						.json(game.toFrontendObject());
				}
			).catch(err => next(err));
		}
	);


exports = module.exports = router;
