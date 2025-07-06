import { ServerGame, ServerPlayer } from "@/server/index.d";
import { Game, Player } from "@/types/index";


export const serverPlayerToPlayer = (player: ServerPlayer): Player => {
    const converted: ServerPlayer = {
        ...player,
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
