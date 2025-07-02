import { ColorID } from "@root/config";
import { Game, Player, SelfPlayer } from "@root/types/index";

export const getCurrentPlayer = (game: Game): Player => {
    const lastCell = game.board.filledCells.length === 0 ?
        null :
        game.board.filledCells[game.board.filledCells.length - 1];

    if (lastCell === null) {
        return game.players[0];
    }

    const colors = game.players.map(({color}) => color);

    const lastPlayerIndex = colors.findIndex((color) => color === lastCell.color);

    if (lastPlayerIndex < 0) {
        throw new Error(`Could not find player for color ${lastCell.color} in game ${game.name}`);
    }

    const nextPlayerIndex = (lastPlayerIndex + 1) % game.players.length;

    return game.players[nextPlayerIndex];
};

export const getUserPlayers = (game: Game): SelfPlayer[] => (
    game.players.filter((player) => "isMe" in player)
) as SelfPlayer[];

export const canAddColor = (
    game: Game,
    color: ColorID
): boolean => game.players.find(
    (player) => player.color === color
) == null;
