import { useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    ClickAwayListener,
    IconButton,
    Menu,
    MenuItem,
    SpeedDial,
    SpeedDialAction,
    Switch,
    Typography,
    useTheme
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import CloseIcon from "@mui/icons-material/Close";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import NotShowingMoveListIcon from "@mui/icons-material/ViewList";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import ShowingMoveListIcon from "@mui/icons-material/ViewListOutlined";

import { Board, type BoardProps } from "@/components/Board";
import type { FilledCell, Game, Player, SelfPlayer } from "@/types";
import Config, { type ColorID } from "@/config";
import { findQuintros } from "@/quintros";
import { getCurrentPlayer } from "@/redux/selectors/game";
import { DimensionInput, type DimensionInputProps } from "@/components/DimensionInput";
import { PlayerLimitInput, type PlayerLimitInputProps } from "@/components/PlayerLimitInput";
import { PlayerIndicators, type IndicatorPropsFunction } from "@/components/PlayerIndicators";
import { ColorPicker, type ColorPickerProps } from "@/components/ColorPicker";
import { AddPlayerButton } from "@/components/AddPlayerButton";
import { MoveList } from "@/components/Sandbox/MoveList";
import styles from "./Sandbox.module.css";


const STORAGE_KEY = "SANDBOX_game";

const getEmptyGame = (): Game => {
    return {
        name: "sandbox",
        board: {
            width: Config.game.board.width.min,
            height: Config.game.board.height.min,
            filledCells: [],
        },
        players: [],
        playerLimit: 6,
        createdAtTimestamp: Date.now(),
        endedAtTimestamp: null,
        startedAtTimestamp: null,
        winnerIndex: null,
    };
};

const arePlayersEqual = (players: Player[], otherPlayers: Player[]) => {
    if (players.length !== otherPlayers.length) {
        return false;
    }

    for (let i = 0; i < players.length; i++) {
        const playerA = players[i];
        const playerB = otherPlayers[i];
        if (playerA.color !== playerB.color) {
            return false;
        }
        if (playerA.id !== playerB.id) {
            return false;
        }
        if (playerA.user?.id !== playerB.user?.id) {
            return false;
        }
    }

    return true;
};

const areGamesEqual = (game: Game, otherGame: Game|null) => {
    if (otherGame == null) {
        return false;
    }

    return game.name === otherGame.name &&
        game.board.width === otherGame.board.width &&
        game.board.height === otherGame.board.height &&
        game.board.filledCells.length === 0 &&
        game.playerLimit === otherGame.playerLimit &&
        arePlayersEqual(game.players, otherGame.players) &&
        game.endedAtTimestamp === otherGame.endedAtTimestamp &&
        game.startedAtTimestamp === otherGame.startedAtTimestamp &&
        game.winnerIndex === otherGame.winnerIndex;
};

const isEmptyGame = (game: Game) => areGamesEqual(game, getEmptyGame());


interface PlayerControlsProps {
    game: Game;
    onPlayerLimitChange: (newLimit: number) => void;
    onPlayerColorChange: (args: {color: ColorID; index: number;}) => void;
    onAddPlayer: (color: ColorID) => void;
    onRemovePlayer: () => void;
}

const PlayerControls = (
    {
        game,
        onPlayerLimitChange,
        onPlayerColorChange,
        onAddPlayer,
        onRemovePlayer,
    }: PlayerControlsProps
) => {
    const [contextMenuAnchorEl, setContextMenuAnchorEl] = useState<HTMLElement|null>(null);
    const [contextMenuPlayerIndex, setContextMenuPlayerIndex] = useState<number|null>(null);
    const [submenuAnchorEl, setSubmenuAnchorEl] = useState<HTMLElement|null>(null);

    const contextMenuPlayer = contextMenuPlayerIndex == null ? null :
        game.players[contextMenuPlayerIndex];


    const handlePlayerLimitChange = useCallback(
        (({value: valueString}) => {
            const value = Number(valueString);

            if (!Number.isNaN(value)) {
                onPlayerLimitChange(value);
            }
        }) as NonNullable<PlayerLimitInputProps["onPlayerLimitChange"]>,
        [
            onPlayerLimitChange,
        ]
    );

    const indicatorPropsFunction = useCallback(
        (({ index }) => ({
            onContextMenu: (event) => {
                event.preventDefault();

                setContextMenuAnchorEl(event.target as HTMLElement);
                setContextMenuPlayerIndex(index);
                
            },
        })) as IndicatorPropsFunction,
        [
            setContextMenuAnchorEl,
            setContextMenuPlayerIndex,
        ]
    );

    const handlePlayerIndicatorContextMenuClose = useCallback(
        () => {
            setContextMenuAnchorEl(null);
            setContextMenuPlayerIndex(null);
            setSubmenuAnchorEl(null);
        },
        [
            setContextMenuAnchorEl,
            setContextMenuPlayerIndex,
            setSubmenuAnchorEl,
        ]
    );

    const handleTogglePresenceMenuItemClick = useCallback(
        () => {
            // const color = game.players[contextMenuPlayerIndex].color;

            // const updatedGame = {
            //     ...updateGame,

            // };

            // setGame(game);
            // return {
            //     game: prevState.game.setIn(
            //         ["playerPresence", color],
            //         !prevState.game.getIn(["playerPresence", color], false)
            //     ),
            // };
        },
        [
            game,
        ]
    );

    const handleToggleIsMeMenuItemClick = useCallback(
        () => {
            if (contextMenuPlayerIndex == null) {
                throw new Error("Tried to toggle the isMe attribute on a player, but no player was selected");
            }
            const updatedGame: Game = {
                ...game,
            };

            updatedGame.players = {
                ...game.players,
            };

            if ((
                updatedGame.players[contextMenuPlayerIndex] as SelfPlayer
            ).isMe) {
                const {isMe, ...player} = (updatedGame.players[contextMenuPlayerIndex] as SelfPlayer);
                updatedGame.players[contextMenuPlayerIndex] = player as Player;
            }
            else {
                (updatedGame.players[contextMenuPlayerIndex] as SelfPlayer).isMe = true;
            }

        },
        [
            game,
            contextMenuPlayerIndex,
        ]
    );

    const handleColorChosen = useCallback(
        (({ color }) => {
            if (contextMenuPlayerIndex == null) {
                throw new Error("Tried to change a player color but no player was selected");
            }
            onPlayerColorChange({
                color,
                index: contextMenuPlayerIndex,
            });
            setContextMenuAnchorEl(null);
			setContextMenuPlayerIndex(null);
			setSubmenuAnchorEl(null);
        }) as ColorPickerProps["onColorChosen"],
        [
            onPlayerColorChange,
            setContextMenuAnchorEl,
            setContextMenuPlayerIndex,
            setSubmenuAnchorEl,
        ]
    );

    const handleAddPlayer = useCallback(
        ({ color }: { color: ColorID; }) => {
            onAddPlayer(color);
        },
        [
            onAddPlayer,
        ]
    );

    const handleRemovePlayerButtonClick = useCallback(
        () => {
            onRemovePlayer()
        },
        [
            onRemovePlayer,
        ]
    );

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
            }}
        >
            <Box
                component="header"
                sx={{
                    width: "100%",
                    display: "flex",
                }}
            >
                <Typography
                    variant="h4"
                >
                    Players
                </Typography>
            </Box>
            <PlayerLimitInput
                playerLimit={"" + game.playerLimit}
                onPlayerLimitChange={handlePlayerLimitChange}
                className={styles.playerLimitInput}
            />
            <PlayerIndicators
                className={styles.playerIndicators}
                game={game}
                indicatorProps={indicatorPropsFunction}
                markActive
            />
            {
                contextMenuAnchorEl !== null && (
                    <Menu
                        anchorEl={contextMenuAnchorEl}
                        open
                        onClose={handlePlayerIndicatorContextMenuClose}
                        anchorOrigin={{
                            horizontal: "left",
                            vertical: "bottom",
                        }}
                    >
                        {/* <MenuItem
                            onClick={handleTogglePresenceMenuItemClick}
                        >
                            <Switch
                                checked={game.playerPresence[contextMenuPlayer.color] || false}
                            />
                            Toggle presence
                        </MenuItem> */}
                        <MenuItem
                            onClick={handleToggleIsMeMenuItemClick}
                        >
                            <Switch
                                checked={contextMenuPlayer != null && "isMe" in contextMenuPlayer}
                            />
                            Toggle whether player is me
                        </MenuItem>
                        <MenuItem
                        >
                            <ColorPicker
                                game={game}
                                onColorChosen={handleColorChosen}
                                selectedColor={contextMenuPlayer?.color}
                            />
                        </MenuItem>
                    </Menu>

                )
            }
            {
                submenuAnchorEl ? (
                    <Menu
                        anchorEl={submenuAnchorEl}
                        open
                        onClose={handlePlayerIndicatorContextMenuClose}
                        anchorOrigin={{
                            horizontal: "right",
                            vertical: "top",
                        }}
                    >
                        <MenuItem
                        >
                            Color
                        </MenuItem>
                    </Menu>
                ) : null
            }
            <div
                className={styles.addRemovePlayerContainer}
            >
                <AddPlayerButton
                    game={game}
                    className={classNames({
                        [styles.hiddenAddPlayerButton]: game.players.length >= game.playerLimit,
                    })}
                    onAdd={handleAddPlayer}
                />
                {
                    game.players.length > 0 && (
                        <IconButton
                            onClick={handleRemovePlayerButtonClick}
                            aria-label="Remove rightmost player"
                            title="Remove rightmost player"
                        >
                            <PersonRemoveIcon
                            />
                        </IconButton>
                    )
                }
            </div>
        </Box>
    );
};

interface GameControlsProps {
    game: Game;
    onPlayerLimitChange: PlayerControlsProps["onPlayerLimitChange"];
    onPlayerColorChange: PlayerControlsProps["onPlayerColorChange"];
    onAddPlayer: PlayerControlsProps["onAddPlayer"];
    onRemovePlayer: PlayerControlsProps["onRemovePlayer"];
    onDimensionChange: (args: {width?: number, height?: number}) => void;
    onCloseGameControls: () => void;
}

const GameControls = (
    {
        game,
        onPlayerLimitChange,
        onPlayerColorChange,
        onAddPlayer,
        onRemovePlayer,
        onDimensionChange,
        onCloseGameControls,
    }: GameControlsProps
) => {
    const [keepRatio, setKeepRatio] = useState(true);
    const handleWidthChange = useCallback(
        (({ value }) => {
            const width = Number(value);
            let height;

            if (!Number.isNaN(width)) {
                if (keepRatio) {
                    const diff = width - game.board.width;
                    
                    height = game.board.height + diff;
                }

                onDimensionChange({ width, height });
            }
        }) as DimensionInputProps["onWidthChange"],
        [
            game,
            keepRatio,
            onDimensionChange,
        ]
    );
    const handleHeightChange = useCallback(
        (({ value }) => {
            const height = Number(value);
            let width;

            if (!Number.isNaN(height)) {
                if (keepRatio) {
                    const diff = height - game.board.height;
                    
                    width = game.board.width + diff;
                }

                onDimensionChange({ width, height });
            }
        }) as DimensionInputProps["onHeightChange"],
        [
            game,
            keepRatio,
        ]
    );

    const handleToggleKeepRatio = useCallback(
        () => {
            setKeepRatio((prevValue) => !prevValue);
        },
        [
            setKeepRatio,
        ]
    );
    
    const handleGameControlsCloseIconClick = useCallback(
        () => {
            onCloseGameControls();
        },
        [
            onCloseGameControls,
        ]
    );

    return (
        <Card
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                overflow: "visible",
            }}
        >
            <CardHeader
                action={(
                    <IconButton
                        onClick={handleGameControlsCloseIconClick}
                        title="Close edit pane"
                        aria-label="Close edit pane"
                    >
                        <CloseIcon />
                    </IconButton>
                )}
                title="Game Controls"
            />
            <CardContent
            >
                <Typography
                    variant="h4"
                >
                    Board
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                    }}
                >
                    <DimensionInput
                        width={game.board.width}
                        height={game.board.height}
                        onWidthChange={handleWidthChange}
                        onHeightChange={handleHeightChange}
                        keepRatio={keepRatio}
                        onToggleKeepRatio={handleToggleKeepRatio}
                    />
                </Box>

                <PlayerControls
                    game={game}
                    onPlayerLimitChange={onPlayerLimitChange}
                    onPlayerColorChange={onPlayerColorChange}
                    onAddPlayer={onAddPlayer}
                    onRemovePlayer={onRemovePlayer}
                />
            </CardContent>
        </Card>
    );
};

export const Sandbox = () => {
    const [game, setGame] = useState<Game>(getEmptyGame());
    const [storedGame, setStoredGame] = useState<Game|null>(null);
    const [shouldShowMoveList, setShouldShowMoveList] = useState(false);
    const [shouldShowGameControls, setShouldShowGameControls] = useState(true);
    const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
    const theme = useTheme();
    const isEmpty = isEmptyGame(game);
    const isStored = areGamesEqual(game, storedGame);
    const isDirty = !isEmpty && !isStored;
    const quintros = useMemo(
        () => findQuintros(
            game.board.filledCells,
            game.board.width,
            game.board.height
        ),
        [
            game,
        ]
    );

    const handleEditGameClick = useCallback(
        () => {
            setShouldShowGameControls(true);
        },
        [
            setShouldShowGameControls,
        ]
    );

    const handleShowMoveListClick = useCallback(
        () => {
            setShouldShowMoveList((prevState) => !prevState);
        },
        [
            setShouldShowMoveList,
        ]
    );

    const handleResetGameButtonClick = useCallback(
        () => {
            setGame(getEmptyGame());
        },
        [
            setGame,
        ]
    );

    const handleSpeedDialClickAway = useCallback(
        () => {
            setIsSpeedDialOpen(false);
        },
        [
            setIsSpeedDialOpen,
        ]
    );

    const handleSaveGameClick = useCallback(
        () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
            setStoredGame(game);
        },
        [
            game,
            setStoredGame,
        ]
    );

    const handleRestoreGameClick = useCallback(
        () => {
            if (storedGame != null) {
                setGame(storedGame);
            }
        },
        [
            setGame,
        ]
    );

    const handleClearGameButtonClick = useCallback(
        () => {
            localStorage.removeItem(STORAGE_KEY);
            setStoredGame(null);
        },
        [
            setStoredGame,
        ]
    );

    const handleCellClick = useCallback(
        (({ cell }) => {
            if (
                game.players.length === 0 ||
                game.winnerIndex != null || cell.color
            ) {
                return;
            }
    
            const updatedGame = {
                ...game,
            };

            updatedGame.board = {
                ...game.board,
                filledCells: [...game.board.filledCells],
            };

            updatedGame.board.filledCells.push({
                position: cell.position,
                color: getCurrentPlayer(updatedGame).color,
            });
            
            const quintros = findQuintros(
                game.board.filledCells,
                game.board.width,
                game.board.height
            );

            if (quintros.length > 0) {
                const winnerIndex = game.players.findIndex((player) => player.color === quintros[0].color);
                updatedGame.winnerIndex = winnerIndex;
            }

            setGame(updatedGame);
        }) as NonNullable<BoardProps["onCellClick"]>,
        [
            game,
            setGame,
        ]
    );
    
	const sliceFilledCells = (
        {
            index,
            game,
        }: {
            index: number;
            game: Game;
        }
    ) => {
        if (index === game.board.filledCells.length) {
            // if there's no change to be done, return game unchanged
            return game;
        }

        const updatedGame = {
            ...game,
        };

        updatedGame.board = {...game.board};
        updatedGame.board.filledCells = game.board.filledCells.slice(0, index);
        updatedGame.winnerIndex === null;

        return updatedGame;
    };

    const handleSelectMove = useCallback(
        (index: number|null) => {
            if (index != null && game.board.filledCells.length === index + 1) {
                return;
            }

            const modifiedGame = sliceFilledCells({
                index: index == null ?
                    0 :
                    index + 1,
                game,
            });

            setGame(modifiedGame);
        },
        [
            setGame,
            game,
        ]
    );

    const handleSpeedDialClick = useCallback(
        () => {
            setIsSpeedDialOpen((isOpen) => !isOpen);
        },
        [
            setIsSpeedDialOpen,
        ]
    );

    const handlePlayerLimitChange = useCallback(
        ((newLimit) => {
            const updatedGame = {
                ...game,
            };

            updatedGame.playerLimit = newLimit;
            const removedPlayers = game.players.slice(newLimit);
            updatedGame.players = game.players.slice(0, newLimit);

            if (removedPlayers.length > 0) {
                const removedColors = removedPlayers.map((player) => player.color);

                updatedGame.board = {
                    ...game.board,
                    filledCells: game.board.filledCells.reduce(
                        (cells, cell) => {
                            if (!removedColors.includes(cell.color)) {
                                cells.push(cell);
                            }
                            return cells;
                        },
                        [] as FilledCell[]
                    ),
                };
            }

            setGame(updatedGame);
        }) as PlayerControlsProps["onPlayerLimitChange"],
        [
            game,
            setGame,
        ]
    );

    const handlePlayerColorChange = useCallback(
        (({ index, color, }) => {
			const currentColor = game.players[index].color;

            const updatedGame: Game = {
                ...game,
                board: {
                    ...game.board,
                    filledCells: [
                        ...game.board.filledCells,
                    ],
                },
                players: [
                    ...game.players.map((player) => ({
                        ...player
                    }))
                ],
            };

            updatedGame.players[index].color = color;
            // playerPresence[color] = prevPlayerPresence[currentColor]
            updatedGame.board.filledCells = game.board.filledCells.map((cell) => {
                if (cell.color === currentColor) {
                    return {
                        ...cell,
                        color,
                    } as FilledCell;
                }

                return cell;
            });

            setGame(updatedGame);
            // delete playerPresence[currentColor]
        }) as GameControlsProps["onPlayerColorChange"],
        []
    );

    const handleDimensionChange = useCallback(
        (({ height, width }) => {
            const updatedGame: Game = {
                ...game,
                board: {
                    ...game.board,
                },
            };

            if (height != null) {
                updatedGame.board.height = height;
            }

            if (width != null) {
                updatedGame.board.width = width;
            }

            setGame(updatedGame);
        }) as GameControlsProps["onDimensionChange"],
        [
            game,
            setGame,
        ]
    );

    const handleCloseGameControls = useCallback(
        () => {
            setShouldShowGameControls(false);
        },
        [
            setShouldShowGameControls,
        ]
    );

    const handleAddPlayer = useCallback(
        (color: ColorID) => {
            const nextIndex = game.players.length;
            const prevPlayer = game.players[game.players.length - 1];

            let updatedGame: Game = {
                ...game,
                board: {
                    ...game.board,
                    filledCells: game.board.filledCells.map((cell) => ({...cell})),
                },
                players: [
                    ...game.players.map((player) => ({
                        ...player
                    }))
                ]
            };

            if (prevPlayer) {
                const firstPrevPlayerMarbleIndex = game.board.filledCells.findIndex(
                    (cell) => cell.color === prevPlayer.color
                );

                if (firstPrevPlayerMarbleIndex >= 0) {
                    updatedGame = sliceFilledCells({
                        index: firstPrevPlayerMarbleIndex + 1,
                        game: updatedGame,
                    });
                }
            }

            updatedGame.players[nextIndex] = {
                id: Date.now(),
                color,
            };

            // playerPresence[color] = true

            setGame(updatedGame);
        },
        [
            game,
            setGame,
        ]
    );

    const handleRemovePlayer = useCallback(
        () => {
			const player = game.players[game.players.length - 1];

			const prevPlayer = game.players[game.players.length - 2];

			let endFilledCellIndex = prevPlayer === undefined ?
				0 :
				game.board.filledCells.findIndex((cell) => cell.color === player.color);
                
            let updatedGame: Game = {
                ...game,
                board: {
                    ...game.board,
                    filledCells: game.board.filledCells.map((cell) => ({...cell})),
                },
                players: [
                    ...game.players.map((player) => ({
                        ...player
                    }))
                ]
            };
			
			if (endFilledCellIndex >= 0) {
				updatedGame = sliceFilledCells({ index: endFilledCellIndex, game });
			}

            updatedGame.players = updatedGame.players.slice(0, -1);

            // delete playerPresence[player.color]

            updatedGame.winnerIndex = null;

            setGame(updatedGame);
        },
        [
            game,
            setGame,
        ]
    );
    
    const speedDialActions = useMemo(
        () => {
            const actions = [
                {
                    name: "Edit game",
                    icon: (
                        <EditIcon />
                    ),
                    handler: handleEditGameClick,
                },
                {
                    name: `${shouldShowMoveList ? "Hide" : "Show"} move list`,
                    icon: shouldShowMoveList ?
                        (
                            <ShowingMoveListIcon />
                        ) :
                        (
                            <NotShowingMoveListIcon />
                        ),
                    handler: handleShowMoveListClick,
                },
            ];
    
            if (!isEmptyGame) {
                actions.push({
                    name: "Reset game",
                    icon: (
                        <ClearIcon />
                    ),
                    handler: handleResetGameButtonClick,
                });
            }

            if (isDirty) {
                actions.push({
                    name: "Store game",
                    icon: (
                        <SaveIcon />
                    ),
                    handler: handleSaveGameClick,
                });
            }

            if (storedGame !== null) {
                if (!isStored) {
                    actions.push({
                        name: "Restore stored game",
                        icon: (
                            <RestoreIcon />
                        ),
                        handler: handleRestoreGameClick,
                    });
                }

                actions.push({
                    name: "Remove stored game",
                    icon: (
                        <DeleteIcon />
                    ),
                    handler: handleClearGameButtonClick,
                });
            }

            return actions;
        },
        [
            shouldShowMoveList,
            isEmptyGame,
            storedGame,
            isStored,
            handleEditGameClick,
            handleShowMoveListClick,
            handleResetGameButtonClick,
            handleSaveGameClick,
            handleRestoreGameClick,
            handleClearGameButtonClick,
        ]
    );

    return (
        <div
            className={styles.root}
        >
            {shouldShowGameControls ? (
                <GameControls
                    game={game}
                    onPlayerLimitChange={handlePlayerLimitChange}
                    onPlayerColorChange={handlePlayerColorChange}
                    onAddPlayer={handleAddPlayer}
                    onRemovePlayer={handleRemovePlayer}
                    onDimensionChange={handleDimensionChange}
                    onCloseGameControls={handleCloseGameControls}
                />
            ) : null}
            <Box
                className={styles.boardContainer}
                sx={{
                    display: "flex",
                    flex: 1,
                    padding: 2,
                }}
            >
                <div
                    className={styles.board}
                >
                    <Board
                        board={game.board}
                        allowPlacement={
                            game.players.length > 0 &&
                            game.startedAtTimestamp != null &&
                            game.winnerIndex == null
                        }
                        onCellClick={handleCellClick}
                        quintros={quintros}
                        gameIsOver={game.winnerIndex != null}
                    />
                </div>
                <ClickAwayListener
                    onClickAway={handleSpeedDialClickAway}
                >
                    <SpeedDial
                        open={isSpeedDialOpen}
                        onClick={handleSpeedDialClick}
                        sx={{
                            position: "fixed",
                            right: theme.spacing(2),
                            bottom: theme.spacing(2),
                        }}
                        icon={(
                            <SpeedDialIcon
                            />
                        )}
                        ariaLabel="Game actions"
                    >
                        {
                            speedDialActions.map(
                                (action) => (
                                    <SpeedDialAction
                                        key={action.name}
                                        icon={action.icon}
                                        slotProps={{
                                            tooltip: {
                                                title: action.name,
                                            },
                                        }}
                                        onClick={action.handler}
                                    />
                                )
                            )
                        }
                    </SpeedDial>
                </ClickAwayListener>
                {
                    shouldShowMoveList && (
                        <MoveList
                            className={styles.moveList}
                            game={game}
                            onSelectMove={handleSelectMove}
                        />
                    )
                }
            </Box>
        </div>
    );
};
