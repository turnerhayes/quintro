import express from 'express';
import { createGame, findGames, getGame, joinGame, startGame } from '@server/persistence/games';
import { getTransaction } from '@server/persistence/base_store';
import { serverGameToGame } from '@server/utils';
import { SelfPlayer } from '@root/types';

const gamesRouter = express.Router();

gamesRouter.get('/:gameName', async (req, res) => {
    const { gameName } = req.params;

    if (!gameName) {
        return res.status(400).json({
            message: 'Game name is required',
        });
    }
    try {
        const game = await getGame({
            name: gameName,
        });
        if (!game) {
            return res.status(404).json({
                message: `Game with name ${gameName} not found`,
            });
        }

        const clientGame = serverGameToGame(game);
        for (let i = 0; i < game.players.length; i++) {
            if (game.players[i].sessionID === req.sessionID) {
                (clientGame.players[i] as SelfPlayer).isMe = true;
            }
        }
        return res.status(200).json(clientGame);
    }
    catch (error) {
        console.error('Error fetching game:', error);
        return res.status(500).json({
            message: 'Failed to fetch game details',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

gamesRouter.post('/', async (req, res) => {
    const { width, height, playerLimit } = req.body;
    if (typeof width !== 'number' || typeof height !== 'number' || typeof playerLimit !== 'number') {
        return res.status(400).json({
            message: 'Invalid input: width, height, and playerLimit must be numbers',
        });
    }
    if (width <= 0 || height <= 0 || playerLimit <= 0) {
        return res.status(400).json({
            message: 'Invalid input: width, height, and playerLimit must be positive numbers',
        });
    }
    try {
        const gameName = await createGame({
            width,
            height,
            playerLimit,
        });
        return res.status(201).location(`/api/games/${gameName}`).json({
            gameName,
        });
    }
    catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({
            message: 'Failed to create game',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

gamesRouter.get('/', async (req, res) => {
    const { playerLimit: playerLimitString } = req.query;
    const playerLimit = playerLimitString ? Number(playerLimitString) : null;
    const includeFullGames = "includeFull" in req.query;

    if (playerLimit !== null && isNaN(playerLimit)) {
        return res.status(400).json({
            message: 'Invalid input: numberOfPlayers must be a number',
        });
    }
    try {
        const games = await findGames({
            playerLimit,
            includeFullGames,
        });
        return res.status(200).json(games);
    }
    catch (error) {
        console.error('Error fetching games:', error);
        return res.status(500).json({
            message: 'Failed to fetch games',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

gamesRouter.put('/:gameName/start', async (req, res) => {
    const { gameName } = req.params;
    if (!gameName) {
        return res.status(400).json({
            message: 'Game name is required',
        });
    }
    try {
        await startGame({
            gameName,
        });
        // Here you would typically start the game in the database
        // For now, we will just return a placeholder response
        return res.status(200).json({
            message: `Game ${gameName} started successfully`,
        });
    }
    catch (error) {
        console.error('Error starting game:', error);
        return res.status(500).json({
            message: 'Failed to start game',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

gamesRouter.post('/:gameName/join', async (req, res) => {
    const { gameName } = req.params;
    const { colors } = req.body;
    if (!gameName) {
        return res.status(400).json({
            message: 'Game name is required',
        });
    }
    if (!Array.isArray(colors)) {
        return res.status(400).json({
            message: 'Colors must be an array',
        });
    }
    try {
        const game = await getGame({
            name: gameName,
        });

        if (!game) {
            return res.status(404).json({
                message: `Game with name ${gameName} not found`,
            });
        }

        const missingColors = colors.filter(
            (color) => !game.players.map((player) => player.color).includes(color)
        );

        if (missingColors.length === 0) {
            return res.status(400).json({
                message: 'All specified colors are already taken in this game',
            });
        }

        try {
            const transaction = getTransaction();
            await transaction.execute(async (trx) => {
                for (const color of missingColors) {
                    await joinGame({
                        gameName,
                        color,
                        sessionID: req.sessionID,
                        transaction: trx,
                    });
                }
            });
        }
        catch (error) {
            console.error('Error joining game:', error);
            return res.status(500).json({
                message: 'Failed to join game',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }

        const updatedGame = await getGame({
            name: gameName,
        });
        if (!updatedGame) {
            return res.status(404).json({
                message: `Game with name ${gameName} not found after joining`,
            });
        }
        
        return res.status(200).json(updatedGame);
    }
    catch (error) {
        console.error('Error joining game:', error);
        return res.status(500).json({
            message: 'Failed to join game',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default gamesRouter;
