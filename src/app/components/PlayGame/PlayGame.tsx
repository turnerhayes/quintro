import React, { CSSProperties, useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useParams } from "react-router";
import classnames         from "classnames";
import Icon               from "@mui/material/Icon";
import Badge              from "@mui/material/Badge";
import Popover, { PopoverProps }            from "@mui/material/Popover";

import { GameJoinDialog, type GameJoinDialogProps } from "@/components/GameJoinDialog";
import { Board, BoardProps }          from "@/components/Board";
import { ZoomControls, ZoomControlsProps }       from "@/components/Board/ZoomControls";
import { PlayerIndicators, PlayerIndicatorsProps } from "@/components/PlayerIndicators";
import { PlayerInfoPopup }    from "@/components/PlayerInfoPopup";
import { AddPlayerButton, AddPlayerButtonProps } from "@/components/AddPlayerButton";
import { gamesApi, useGetGameQuery } from "@/api/games";
import { getCurrentPlayer, getUserPlayers } from "@/redux/selectors/game-selectors";
import Config            from "@root/config";
import type { Game, Player, SelfPlayer } from "@root/types";
import { socketClient } from "@root/app/api/socket-client";

import { StartGameOverlay, StartGameOverlayProps } from "./StartGameOverlay";
import { WinnerBanner }     from "./WinnerBanner";
import * as styles from "./PlayGame.module.scss";
import { useAppDispatch } from "@root/app/redux/hooks";


const PlayGameContent = (
    {
        game,
    }: {
        game: Game;
    }
) => {
    const currentUserPlayers = getUserPlayers(game);
    const hasJoinedGame = currentUserPlayers.length > 0;
    const intl = useIntl();
    const [selectedPlayerColor, setSelectedPlayerColor] = useState<string|null>(null);
    const [selectedIndicatorEl, setSelectedIndicatorEl] = useState<HTMLElement|null>(null);
    const [currentZoomLevel, setCurrentZoomLevel] = useState(1);
    const dispatch = useAppDispatch();
    const isWatchingGame = false; //TODO: implement watching logic


    const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
        if (!isMounted) {
            setIsMounted(true);
        }

        if (hasJoinedGame) {
            socketClient.establishGameConnection({
                gameName: game.name,
            });
        }
	}, [
        isMounted,
        setIsMounted,
        hasJoinedGame,
        game,
    ]);

    const handleJoinSubmit = useCallback(
        (({ color }) => {
            socketClient.joinGame({
                gameName: game.name,
                color,
            });
        }) as GameJoinDialogProps["onSubmit"],
        [
            game,
        ]
    );

    const handleJoinCancel = useCallback(
        (() => {
        }) as GameJoinDialogProps["onCancel"],
        []
    );

    const onWatchGame = useCallback(
        (() => {
            socketClient.establishGameConnection({
                gameName: game.name,
            });
        }) as NonNullable<GameJoinDialogProps["onWatchGame"]>,
        [
            game,
        ]
    );

    const handlePlayerIndicatorClick = useCallback(
        ((
            {
                selectedPlayer,
                element,
            }
        ) => {
            if (selectedPlayer == null) {
                return;
            }

            setSelectedIndicatorEl(element);
            setSelectedPlayerColor(selectedPlayer?.color ?? null);
        }) as NonNullable<PlayerIndicatorsProps["onIndicatorClick"]>,
        [
            setSelectedIndicatorEl,
            setSelectedPlayerColor,
        ]
    );

    const handleAddPlayer = useCallback(
        (({
            color,
        }) => {
            socketClient.joinGame({
                gameName: game.name,
                color,
            })
        }) as AddPlayerButtonProps["onAdd"],
        [
            game,
        ]
    );

    const closePopover = useCallback(
        (() => {
            setSelectedIndicatorEl(null);
            setSelectedPlayerColor(null);
        }) as NonNullable<PopoverProps["onClose"]>,
        [
            setSelectedIndicatorEl,
            setSelectedPlayerColor,
        ]
    );

    const handleZoomLevelChange = useCallback(
        ((zoomLevel) => {
            setCurrentZoomLevel(zoomLevel);
        }) as ZoomControlsProps["onZoomLevelChange"],
        [
            setCurrentZoomLevel,
        ]
    );

    const handleStartGameButtonClick = useCallback(
        (() => {
            socketClient.startGame({
                gameName: game.name,
            });
        }) as NonNullable<StartGameOverlayProps["onStartClick"]>,
        [
            game,
        ]
    );

    const handleCellClick = useCallback(
        (({
            cell,
        }) => {
            if (
                game.winnerIndex != null || cell.color ||
                !hasJoinedGame
            ) {
                return;
            }
    
            const currentPlayer = getCurrentPlayer(game);
    
            if (!(currentUserPlayers as Player[]).includes(currentPlayer)) {
                return;
            }

            dispatch(
                gamesApi.util.updateQueryData(
                    "getGame",
                    {
                        gameName: game.name,
                    },
                    (game) => {
                        game.board.filledCells.push(
                            {
                                color: currentPlayer.color,
                                position: cell.position,
                            }
                        );

                        return game;
                    }
                )
            );

            socketClient.placeMarble({
                gameName: game.name,
                position: cell.position,
                color: currentPlayer.color,
            });
        }) as NonNullable<BoardProps["onCellClick"]>,
        [
            currentUserPlayers,
            game,
            dispatch,
        ]
    )

    const gameIsOver = game.winnerIndex != undefined;

    if (!(hasJoinedGame || isWatchingGame || gameIsOver)) {
        return (
            <GameJoinDialog
                game={game}
                onSubmit={handleJoinSubmit}
                onCancel={handleJoinCancel}
                onWatchGame={onWatchGame}
            />
        );
    }

    let playerInfoPopover: React.ReactNode|null = null;

    if (selectedPlayerColor != null) {
        const player = game.players.find(
            (player: Player) => player.color === selectedPlayerColor
        );
    
        if (!player) {
            throw new Error(`Could not find player for color ${selectedPlayerColor}`);
        }
    
        playerInfoPopover = selectedIndicatorEl === null ? null : (
            <PlayerInfoPopup
                player={player}
            />
        );
    }

    const currentPlayer = getCurrentPlayer(game);
    const myTurn = currentPlayer !== null && currentUserPlayers.includes(currentPlayer as SelfPlayer);
    const gameIsStarted = game.startedAtTimestamp != null && !gameIsOver;

    let watcherSummary: string|null = null;

    const watcherCount = 0; //TODO: Get actual watcher count
    
    if (watcherCount > 0) {
        if (isWatchingGame) {
            watcherSummary = intl.formatMessage({
                id: "quintro.components.PlayGame.watchers.summary.withYou",
                defaultMessage: `You {watcherCount, plural,
    =0 {}
    one {and 1 other person}
    other {and {watcherCount} other people}
} are watching this game.`
            }, {
                watcherCount: watcherCount - 1,
            });
        }
        else {
            watcherSummary = intl.formatMessage({
                id: "quintro.components.PlayGame.watchers.summary.withoutYou",
                defaultMessage: `{watcherCount, plural,
    one {1 person is}
    other {{watcherCount} people are}
} watching this game.`,
            }, {
                watcherCount,
            });
        }
    }
    
    const boardContainerStyles = {
        "--zoom-level": currentZoomLevel,
        "--self-player-color": currentPlayer.color,
    } as CSSProperties;

    return (
        <div
            className={classnames(
                styles.root,
                {
                    "myTurn": myTurn,
                    "game-over": gameIsOver,
                    "game-started": gameIsStarted,
                }
            )}
            style={boardContainerStyles}
        >
            {
                watcherSummary && (
                    <div>
                        <Badge
                            badgeContent={watcherCount}
                            color="primary"
                            className={styles.watcherBadge}
                        >
                            <Icon
                                className={classnames(
                                    "icon",
                                    styles.watcherIcon
                                )}
                            >watcher</Icon>
                        </Badge> {watcherSummary}
                    </div>
                )
            }
            <div
                className={styles.gameControls}
            >
                <div
                    className={styles.playerControls}
                >
                    <PlayerIndicators
                        game={game}
                        markActive={gameIsStarted}
                        onIndicatorClick={handlePlayerIndicatorClick}
                    />
                    {
                        game.players.length < game.playerLimit && (
                            <AddPlayerButton
                                className={styles.addPlayerButton}
                                game={game}
                                onAdd={handleAddPlayer}
                            />
                        )
                    }
                </div>
                <Popover
                    key="player indicator popover"
                    open={!!selectedIndicatorEl}
                    onClose={closePopover}
                    anchorEl={selectedIndicatorEl}
                    closeAfterTransition
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                    }}
                >
                    {playerInfoPopover}
                </Popover>
                <ZoomControls
                    className={styles.zoomControls}
                    onZoomLevelChange={handleZoomLevelChange}
                    currentZoomLevel={currentZoomLevel}
                    minZoomLevel={0.2}
                    maxZoomLevel={3}
                    stepSize={0.2}
                />
            </div>
            <div
                className={styles.gameArea}
            >
                <div
                    className={styles.boardContainer}
                >
                    {
                        !gameIsStarted && !gameIsOver && !isWatchingGame && (
                            <StartGameOverlay
                                canStart={game.players.length >= Config.game.players.min}
                                onStartClick={handleStartGameButtonClick}
                            />
                        )
                    }
                    {
                        gameIsOver && (
                            <WinnerBanner
                                winnerColor={game.players[game.winnerIndex!].color}
                            />
                        )
                    }
                    <Board
                        board={game.board}
                        allowPlacement={myTurn && gameIsStarted}
                        onCellClick={handleCellClick}
                        gameIsOver={game.winnerIndex != undefined}
                        quintros={[]} // TODO: get quintros
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * Component for rendering the game UI.
 *
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
export const PlayGame = (
    // {
    //     game,
    //     isInGame,
    //     hasJoinedGame,
    //     currentUserPlayers,
    //     watcherCount,
    //     isWatchingGame,
    //     classes,
    // }: {
    //     game: Game;
    //     isInGame: boolean;
    //     hasJoinedGame: boolean;
    //     currentUserPlayers: Player[];
    //     watcherCount: number;
    //     isWatchingGame: boolean;
    //     classes?: {
    //         root: string;
    //         watcherBadge: string;
    //         watcherIcon: string;
    //         gameControls: string;
    //         playerControls: string;
    //         addPlayerButton: string;
    //         zoomControls: string;
    //         gameArea: string;
    //         boardContainer: string;
    //     };
    // }
) => {
    const params = useParams();
    const gameName = params.gameName || "";
    if (!gameName) {
        throw new Error("Game name is required");
    }
    // const game = useAppSelector((state) => getGame(state, { gameName }));
    const {data: game, error, isLoading} = useGetGameQuery({ gameName });

    if (isLoading || !game) {
        return null; // or a loading state
    }
    
    return (
        <PlayGameContent
            game={game}
        />
    );
}
