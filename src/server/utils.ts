import { ServerGame, ServerPlayer } from "@/server/index.d";
import { Game, Player } from "@/types/index";


export const serverPlayerToPlayer = (serverPlayer: ServerPlayer, sessionID?: string): Player => {
    const { sessionID: playerSessionID, ..._player } = serverPlayer;
    const player: Player = _player as Player;

    delete player.sessionID;

    if (sessionID && playerSessionID === sessionID) {
        (player as Player & { isMe: boolean }).isMe = true;
    }
    return player;
};

export const serverGameToGame = (game: ServerGame, sessionID?: string): Game => {
    const converted: Game = {
        ...game,
        players: game.players.map((player) => serverPlayerToPlayer(player, sessionID)),
    };

    return converted as Game;
};
