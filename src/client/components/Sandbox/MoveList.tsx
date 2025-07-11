import { useCallback, useEffect, useRef } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import ClearAllIcon from "@mui/icons-material/ClearAll";

import { ColorSwatch } from "@/client/components/ColorPicker";
import type { FilledCell, Game } from "@/types";
import styles from "./MoveList.module.css";
import classNames from "classnames";
import { ListItemButton } from "@mui/material";


interface MoveItemProps {
    index: number;
    cell: FilledCell;
    isLastItem: boolean;
    onClick: (index: number) => void;
}

const MoveItem = (
    {
        index,
        cell,
        isLastItem,
        onClick,
    }: MoveItemProps
) => {
    const handleClick = useCallback(
        () => {
            onClick(index);
        },
        [
            index,
        ]
    );

    const itemContent = (
        <>
            <ListItemIcon>
                <ColorSwatch
                    color={cell.color}
                />
            </ListItemIcon>
            <ListItemText
                primary={cell.position.join(", ")}
            >
            </ListItemText>
        </>
    );

    if (isLastItem) {
        return (
            <ListItem
                onClick={handleClick}
            >
                {itemContent}
            </ListItem>
        )
    }

    return (
        <ListItemButton
            onClick={handleClick}
        >
            {itemContent}
        </ListItemButton>
    );
};

export interface MoveListProps {
    className?: string;
    game: Game;
    onSelectMove: (index: number|null) => void;
}

export const MoveList = (
    {
        game,
        onSelectMove,
        className,
    }: MoveListProps
) => {
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(
        () => {
            if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
            }
        },
        [
            listRef,
        ]
    );

    const handleMoveItemClick = useCallback(
        ((index) => {
            onSelectMove && onSelectMove(index);
        }) as MoveItemProps["onClick"],
        [
            onSelectMove,
        ]
    );

    const handleClearAllMoves = useCallback(
        () => {
            onSelectMove && onSelectMove(null);
        },
        [
            onSelectMove,
        ]
    );

    const hasMoves = game.board.filledCells.length > 0;

    return (
        <div
            className={classNames(
                styles.root,
                className
            )}
        >
            <header
                className={styles.listHeader}
            >
                <h1>Moves</h1>
                {
                    hasMoves && (
                        <IconButton
                            onClick={handleClearAllMoves}
                            aria-label="Clear all moves"
                            title="Clear all moves"
                        >
                            <ClearAllIcon />
                        </IconButton>
                    )
                }
            </header>
            {
                hasMoves ?
                    (
                        <List
                            classes={{
                                root: styles.list,
                            }}
                            ref={listRef}
                        >
                            {
                                game.board.filledCells.map(
                                    (cell, index) => (
                                        <MoveItem
                                            key={`${JSON.stringify(cell.position)}`}
                                            index={index}
                                            cell={cell}
                                            isLastItem={index < game.board.filledCells.length - 1}
                                            onClick={handleMoveItemClick}
                                        />
                                    )
                                )
                            }
                        </List>
                    ) : (
                        <div>No moves made yet</div>
                    )
            }
        </div>
    );
};
