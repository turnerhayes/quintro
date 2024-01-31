"use client";

import { useCallback } from "react";
import {useRouter} from "next/navigation";
import PlayGame from "@app/components/PlayGame";
import { useAppDispatch } from "@app/redux/hooks";
import { useGetGamesQuery } from "@lib/services/games-service";
import { Player } from "@shared/quintro.d";
import { joinGame, watchGame } from "@lib/redux/actions/games";


const PlayGameContainer = ({
    gameName,
}: {
    gameName: string;
}) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const handleJoinGame = useCallback(({colors}: {colors: string[];}) => {
        dispatch(joinGame({gameName, colors}))
    }, [dispatch, gameName]);

    const handleWatchGame = useCallback(() => {
        dispatch(watchGame(gameName));
    }, [dispatch, gameName]);

    const handleCancelJoin = () => {
        // TODO: make this a Redux action?
        router.back();
    };
    
	const {
		data: games,
		isLoading,
		isSuccess,
		error,
	} = useGetGamesQuery({gameName});
    
    if (isSuccess) {
        if (games.length > 0) {
            const game = games[0];
            return (
                <PlayGame
                    game={game}
                    hasJoinedGame={false}
                    currentUserPlayers={new Set<Player>()}
                    isInGame={false}
                    isWatchingGame={false}
                    watcherCount={0}
                    onJoinGame={handleJoinGame}
                    onCancelJoin={handleCancelJoin}
                    onWatchGame={handleWatchGame}
                />
            );
        }
        else {
            // TODO: Make a better error page
            return (
                <div>
                    Game {gameName} was not found
                </div>
            );
        }
    }
    if (isLoading) {
        // TODO: make better loading UI
        return (
            <div>
                Loading game, please wait...
            </div>
        );
    }
    
    // TODO: make better error page
    return (
        <div>
            {JSON.stringify(error)}
        </div>
    );
};

export default PlayGameContainer;
