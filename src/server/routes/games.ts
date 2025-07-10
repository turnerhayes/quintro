import express from 'express';
import createDebugger from 'debug';
import { createGame, findGames, getGame } from '@/server/persistence/games';
import { serverGameToGame } from '@/server/utils';


const debug = createDebugger('quintro:server:routes:games');

const gamesRouter = express.Router();

gamesRouter.get('/:gameName', async (req, res): Promise<void> => {
    const { gameName } = req.params;

    if (!gameName) {
        res.status(400).json({
            message: 'Game name is required',
        });
        return;
    }
    try {
        const game = await getGame({
            name: gameName,
        });
        if (!game) {
            res.status(404).json({
                message: `Game with name ${gameName} not found`,
            });
            return;
        }

        
        const clientGame = serverGameToGame(game, req.sessionID);
        res.status(200).json(clientGame);
    }
    catch (error) {
        debug('Error fetching game:', error);
        res.status(500).json({
            message: 'Failed to fetch game details',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

gamesRouter.post('/', async (req, res): Promise<void> => {
    const { width, height, playerLimit } = req.body;
    if (typeof width !== 'number' || typeof height !== 'number' || typeof playerLimit !== 'number') {
        res.status(400).json({
            message: 'Invalid input: width, height, and playerLimit must be numbers',
        });
        return;
    }
    if (width <= 0 || height <= 0 || playerLimit <= 0) {
        res.status(400).json({
            message: 'Invalid input: width, height, and playerLimit must be positive numbers',
        });
        return;
    }
    try {
        const gameName = await createGame({
            width,
            height,
            playerLimit,
        });
        res.status(201).location(`/api/games/${gameName}`).json({
            gameName,
        });
        return;
    }
    catch (error) {
        debug('Error creating game:', error);
        res.status(500).json({
            message: 'Failed to create game',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

gamesRouter.get('/', async (req, res): Promise<void> => {
    const { playerLimit: playerLimitString } = req.query;
    const playerLimit = playerLimitString ? Number(playerLimitString) : null;
    const includeFullGames = "includeFull" in req.query;

    if (playerLimit !== null && isNaN(playerLimit)) {
        debug('Invalid playerLimit:', playerLimitString);
        res.status(400).json({
            message: 'Invalid input: numberOfPlayers must be a number',
        });
        return;
    }
    try {
        const games = await findGames({
            playerLimit,
            includeFullGames,
        });
        res.status(200).json(games);
        return;
    }
    catch (error) {
        debug('Error fetching games:', error);
        res.status(500).json({
            message: 'Failed to fetch games',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default gamesRouter;
