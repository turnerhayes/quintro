const express = require("express");
const cors = require("cors");
const GameStore = require("../../persistence/stores/game");

const gameRouter = express.Router();

gameRouter.use(cors())

gameRouter.get("/", async (req, res, next) => {
    const games = await GameStore.findGames();
    res.json(games);
}).post("/", express.json(), async (req, res, next) => {
    const {
        name,
        playerLimit,
        width,
        height,
     } = req.body;

    let validationError;

    if (!name) {
        validationError = "name is required to create a game";
    }
    if (!playerLimit || playerLimit < 3) {
        validationError = "playerLimit must be greater than or equal to 3 to create a game";
    }
    if (!width) {
        validationError = "width is required to create a game";
    }
    if (!height) {
        validationError = "height is required to create a game";
    }

    if (validationError) {
        next(validationError);
        return;
    }

    try {
        const game = await GameStore.createGame({
            name,
            playerLimit,
            width,
            height,
        });

        res.status(201).setHeader("Location", `/games/${game.name}`);
        res.format({
            html: () => res.send("Game created."),
            json: () => res.json({
                status: "created",
                name: game.name,
            })
        });
    }
    catch(ex) {
        next(ex);
    }
});

gameRouter.get("/:name", async (req, res, next) => {
    const name = req.params.name;
    try {
        const game = await GameStore.getGame({name});
    
        res.json(game);
    }
    catch (ex) {
        next(ex);
    }
});

module.exports = gameRouter;
