import createDebugger from "debug";
import { type ColorID } from "@/config";
import type { Game, Player, SelfPlayer } from "@/types/index";


const debug = createDebugger("quintro:client:selectors:game");

export const getCurrentPlayer = (game: Game): Player => {
    const lastCell = game.board.filledCells.length === 0 ?
        null :
        game.board.filledCells[game.board.filledCells.length - 1];

    debug("Filled cells:", game.board.filledCells);

    if (lastCell === null) {
        debug("No filled cells found, returning first player");
        return game.players[0];
    }

    const colors = game.players.map(({color}) => color);

    debug(`Last cell color: ${lastCell.color}, Players colors: ${colors.join(", ")}`);

    const lastPlayerIndex = colors.findIndex((color) => color === lastCell.color);

    debug(`Last player index: ${lastPlayerIndex}`);

    if (lastPlayerIndex < 0) {
        throw new Error(`Could not find player for color ${lastCell.color} in game ${game.name}`);
    }

    const nextPlayerIndex = (lastPlayerIndex + 1) % game.players.length;
    debug(`Next player index: ${nextPlayerIndex}`);

    debug(`Next player:`, game.players[nextPlayerIndex]);

    return game.players[nextPlayerIndex];
};

export const getUserPlayers = (game: Game): SelfPlayer[] => (
    game.players.filter((player) => "isMe" in player)
) as SelfPlayer[];

export const canAddColor = (
    game: Game,
    color: ColorID
): boolean => game.players.findIndex(
    (player) => player.color === color
) < 0;
