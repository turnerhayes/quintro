"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FindGame from "@app/components/FindGame";
import { FindOpenGamesArgs, useFindOpenGamesQuery } from "@lib/services/games-service";
import { SkipToken, skipToken } from "@reduxjs/toolkit/query";


const FindGameContainer = () => {
    const router = useRouter();
    const [numberOfPlayers, setNumberOfPlayers] = useState("");
	const [queryState, setQueryState] = useState<FindOpenGamesArgs|SkipToken>(skipToken);
    const [isCanceled, setIsCanceled] = useState(false);
    const baseQueryResults = useFindOpenGamesQuery(queryState);

    useEffect(() => {
        if (baseQueryResults.isSuccess || baseQueryResults.isError) {
            setIsCanceled(false);
        }
    });

    const cancel = useCallback(() => setIsCanceled(true), [setIsCanceled]);

    const {
        data: results,
        error: findGameError,
        isFetching: isSearching,
    } = {
        ...baseQueryResults,
        isFetching: isCanceled ? false : baseQueryResults.isFetching,
        data: isCanceled ? null : baseQueryResults.data,
    };
    // const {
    //     data: results,
    //     error: findGameError,
    //     isFetching: isSearching,
    // } = useFindOpenGamesQuery(queryState);

    const handleJoinGame = useCallback(({gameName}: {gameName: string;}) => {
        router.push(`/play/${gameName}`);
    }, [router]);

    const handleFindOpenGames = useCallback(() => {
        setQueryState({
            numberOfPlayers: numberOfPlayers ? Number(numberOfPlayers) : null,
        });
    }, [setQueryState, numberOfPlayers]);

    const handleChangeNumPlayers = useCallback((numberOfPlayers: string) => {
        setNumberOfPlayers(numberOfPlayers);
    }, [setNumberOfPlayers]);

    const handleCancelSearch = useCallback(() => {
        cancel();
        // setIsSearching(false);
    }, [cancel, /* setIsSearching */]);

    return (
        <FindGame
            isSearching={isSearching}
            numberOfPlayers={numberOfPlayers}
            onFindOpenGames={handleFindOpenGames}
            onChangeNumberOfPlayers={handleChangeNumPlayers}
            onJoinGame={handleJoinGame}
            onCancelSearch={handleCancelSearch}
            results={results}
            findGameError={findGameError}
        />
    );
};

export default FindGameContainer;
