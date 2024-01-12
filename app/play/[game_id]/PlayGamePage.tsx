'use client';

import PlayGame from "@app/components/PlayGame";
import { selectors } from "@lib/redux/selectors";
import { useAppStore } from "@app/redux/hooks";
import { actions as gameActions } from "@lib/redux/slices/games";
import { Player } from "@shared/quintro";
import { useCallback } from "react";


const PlayGamePage = () => {

    const handleJoinGame = useCallback(() => {

    }, []);

    return (
        <PlayGame
            gameName="test1"
            playerUsers={[]}
            hasJoinedGame={false}
            currentUserPlayers={new Set<Player>()}
            isInGame={false}
            isWatchingGame={false}
            watcherCount={0}
            onJoinGame={handleJoinGame}
        />
    )
};

export default PlayGamePage;