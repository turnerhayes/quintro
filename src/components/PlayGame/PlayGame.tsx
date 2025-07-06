import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import classnames         from "classnames";
import Icon               from "@mui/material/Icon";
import Badge              from "@mui/material/Badge";
import Popover, { type PopoverProps }            from "@mui/material/Popover";

import { GameJoinDialog, type GameJoinDialogProps } from "@/components/GameJoinDialog";
import { Board, type BoardProps }          from "@/components/Board";
import { ZoomControls, type ZoomControlsProps }       from "@/components/Board/ZoomControls";
import { PlayerIndicators, type PlayerIndicatorsProps } from "@/components/PlayerIndicators";
import { PlayerInfoPopup }    from "@/components/PlayerInfoPopup";
import { AddPlayerButton, type AddPlayerButtonProps } from "@/components/AddPlayerButton";
import { gamesApi } from "@/api/games";
import { getCurrentPlayer, getUserPlayers } from "@/redux/selectors/game";
import { useAppDispatch } from "@/redux/hooks";
import Config            from "@/config";
import type { Game, Player, SelfPlayer } from "@/types";
import { socketClient } from "@/api/socket-client.client";

import { StartGameOverlay, type StartGameOverlayProps } from "./StartGameOverlay";
import { WinnerBanner }     from "./WinnerBanner";
import styles from "./PlayGame.module.css";
import { findQuintros } from "@/quintros";
import { Box, useTheme, type SxProps } from "@mui/material";
import { useNavigate } from "react-router";


export const PlayGame = (
    {
        game,
    }: {
        game: Game;
    }
) => {
    const currentUserPlayers = getUserPlayers(game);
    const hasJoinedGame = currentUserPlayers.length > 0;
    const intl = useIntl();
    const theme = useTheme();
    const navigate = useNavigate();
    const [selectedPlayerColor, setSelectedPlayerColor] = useState<string|null>(null);
    const [selectedIndicatorEl, setSelectedIndicatorEl] = useState<HTMLElement|null>(null);
    const [currentZoomLevel, setCurrentZoomLevel] = useState(1);
    const dispatch = useAppDispatch();
    const isWatchingGame = false; //TODO: implement watching logic
    const quintros = useMemo(
        () => findQuintros(game.board.filledCells, game.board.width, game.board.height),
        [
            game.board.filledCells,
            game.board.width,
            game.board.height,
        ]
    );


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
            navigate(-1);
        }) as GameJoinDialogProps["onCancel"],
        [
            navigate,
        ]
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

    let playerInfoPopover: ReactNode|null = null;

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

    const boardContainerSx: SxProps = {
        position: "relative",
        display: "flex",
        alignSelf: "center",
        justifyContent: "center",
        fontSize: `${currentZoomLevel}em`,
        paddingTop: theme.spacing(2),
    };

    if (myTurn && gameIsStarted) {
        boardContainerSx.outline = "1px solid black";
        boardContainerSx.border = `7px solid ${currentPlayer.color}`;
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                position: "relative",
            }}
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
            <Box
                sx={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {
                    !gameIsStarted && !gameIsOver && !isWatchingGame && (
                        <StartGameOverlay
                            className={styles.startGameOverlay}
                            canStart={game.players.length >= Config.game.players.min}
                            onStartClick={handleStartGameButtonClick}
                        />
                    )
                }
                {
                    gameIsOver && (
                        <WinnerBanner
                            className={styles.winnerBanner}
                            winnerColor={game.players[game.winnerIndex!].color}
                        />
                    )
                }
                <Box
                    sx={{
                        overflow: "auto",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <Box
                        sx={boardContainerSx}
                    >
                        <Board
                            board={game.board}
                            allowPlacement={myTurn && gameIsStarted}
                            onCellClick={handleCellClick}
                            gameIsOver={game.winnerIndex != undefined}
                            quintros={quintros}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
