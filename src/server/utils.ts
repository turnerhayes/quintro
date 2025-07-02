import { ServerGame, ServerPlayer } from "@server/index.d";
import { Game, Player } from "@root/types/index";


export const serverPlayerToPlayer = (player: ServerPlayer): Player => {
    const converted: Player = {
        ...player,
        sessionID: undefined,
    };

    delete converted.sessionID;

    return converted as Player;
};

export const serverGameToGame = (game: ServerGame): Game => {
    const converted: Game = {
        ...game,
        players: game.players.map(serverPlayerToPlayer)
    };

    return converted as Game;
};