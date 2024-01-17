"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import FindGame from "@app/components/FindGame";
import { useFindOpenGamesQuery } from "@lib/services/games-service";


const FindGameContainer = () => {
    const router = useRouter();

    const handleJoinGame = useCallback(({gameName}: {gameName: string;}) => {
        router.push(`play/${gameName}`);
    }, [router]);

    const handleFindOpenGames = useCallback(({numberOfPlayers}: {numberOfPlayers?: number}) => {
        useFindOpenGamesQuery(numberOfPlayers);
    }, []);

    const handleCancelFind = useCallback(() => {}, []);

    return (
        <FindGame
            onFindOpenGames={handleFindOpenGames}
            onCancelFind={handleCancelFind}
            onJoinGame={handleJoinGame}
        />
    );
};

export default FindGameContainer;
