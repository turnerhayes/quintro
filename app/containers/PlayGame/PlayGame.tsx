import PlayGame from "@app/components/PlayGame";
import { Player } from "@shared/quintro.d";
import { useCallback } from "react";


const PlayGameContainer = ({
    gameName,
}: {
    gameName: string;
}) => {
    const handleJoinGame = useCallback(() => {

    }, []);


    return (
        <PlayGame
            gameName={gameName}
            playerUsers={[]}
            hasJoinedGame={false}
            currentUserPlayers={new Set<Player>()}
            isInGame={false}
            isWatchingGame={false}
            watcherCount={0}
            onJoinGame={handleJoinGame}
        />
    );
};

export default PlayGameContainer;
