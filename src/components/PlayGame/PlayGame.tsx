import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate, useParams } from "react-router";
import createDebugger from "debug";
import Badge              from "@mui/material/Badge";
import Popover, { type PopoverProps } from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { useTheme, type SxProps } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EyeIcon from "@mui/icons-material/Visibility";

import {
    GameJoinDialog,
    type GameJoinDialogProps
} from "@/components/GameJoinDialog";
import { Board, type BoardProps }          from "@/components/Board";
import {
    ZoomControls,
    type ZoomControlsProps
}       from "@/components/Board/ZoomControls";
import {
    PlayerIndicators,
    type PlayerIndicatorsProps
} from "@/components/PlayerIndicators";
import { PlayerInfoPopup } from "@/components/PlayerInfoPopup";
import {
    AddPlayerButton,
    type AddPlayerButtonProps
} from "@/components/AddPlayerButton";
import { gamesApi } from "@/api/games";
import { getCurrentPlayer, getUserPlayers } from "@/redux/selectors/game";
import { useAppDispatch } from "@/redux/hooks";
import Config from "@/config";
import type { Game, Player, SelfPlayer } from "@/types";
import { socketClient } from "@/api/socket-client.client";
import { findQuintros } from "@/quintros";

import { StartGameOverlay, type StartGameOverlayProps } from "./StartGameOverlay";
import styles from "./PlayGame.module.css";


const debug = createDebugger("quintro:client:components:PlayGame");

const WinnerBanner = (
    {
        game,
    }: {
        game: Game;
    }
) => {
    const [hideWinnerBanner, setHideWinnerBanner] = useState(false);
    const handleWinnerBannerClose = useCallback(
        () => {
            setHideWinnerBanner(true);
        },
        [
            setHideWinnerBanner,
        ]
    );

    if (hideWinnerBanner) {
        return null;
    }

    return (
        <Dialog
            open
            maxWidth="lg"
            onClose={handleWinnerBannerClose}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <IconButton
                    aria-label="Close"
                    onClick={handleWinnerBannerClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent
            >
                <DialogContentText
                    variant="h1"
                >
                    <FormattedMessage
                        id="quintro.components.PlayGame.winMessage"
                        defaultMessage="{winnerColor} wins!"
                        values={{
                            winnerColor: Config.game.colors.get(
                                game.players[game.winnerIndex!].color
                            ).name,
                        }}
                    />
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
}

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
        (async ({
            cell,
        }) => {
            if (
                game.winnerIndex != null || cell.color ||
                !hasJoinedGame
            ) {
                debug("Game is over or cell is already filled or you are not a part of the game, ignoring click.");
                return;
            }
    
            if (!(currentUserPlayers as Player[]).includes(currentPlayer)) {
                debug("It is not your turn, ignoring click.");
                return;
            }

            // Optimistically update the game state in the Redux store
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
            game.name,
            game.board.filledCells,
            game.winnerIndex,
            hasJoinedGame,
            dispatch,
        ]
    );

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
                            <EyeIcon
                            />
                        </Badge> {watcherSummary}
                    </div>
                )
            }
            <div
                className={styles.gameControls}
            >
                <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    pb={2}
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
                </Box>
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
                            canStart={game.players.length >= Config.game.players.min}
                            onStartClick={handleStartGameButtonClick}
                        />
                    )
                }
                {
                    gameIsOver && (
                        <WinnerBanner
                            game={game}
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
};

export const PlayGame = () => {
    const params = useParams() as { gameName: string };

    const { data: game, isLoading, error } = gamesApi.endpoints.getGame.useQuery(
        {
            gameName: params.gameName,
        }
    );

    if (isLoading) {
        // TODO: Show loading UI
        return (
            <div>
                Loading game...
            </div>
        );
    }

    if (error) {
        debug("Error loading game:", error);
        // TODO: Show error UI
        return (
            <div>
                Error loading game. Please try again later.
            </div>
        );
    }

    if (!game) {
        debug("Game not found:", params.gameName);
        // TODO Show missing game UI
        return (
            <div>
                Game not found. Please check the URL or try again later.
            </div>
        );
    }

    return (
        <PlayGameContent
            game={game}
        />
    );
};
