import React, { FormEvent, useCallback, useEffect, useState }         from "react";
import { Link }      from "react-router";
import { useSelector } from "react-redux";
import Dialog        from "@mui/material/Dialog";
import Card          from "@mui/material/Card";
import CardHeader    from "@mui/material/CardHeader";
import CardContent   from "@mui/material/CardContent";
import Button        from "@mui/material/Button";
import {
	FormattedMessage,
    useIntl,
}                    from "react-intl";

import { ColorPicker }  from "@/components/ColorPicker";
import { getDefaultColorForGame } from "@/components/ColorPicker/ColorPicker";

import type { Game } from "@root/types";
import { ColorID } from "@root/config";
import { canAddColor } from "@root/app/redux/selectors/game-selectors";


export interface GameJoinDialogProps {
    game: Game;
    onCancel: () => void;
    onSubmit: (args: {color: string;}) => void;
    onWatchGame?: () => void;
}

const CannotJoinGameComponent = (
    {
        reason,
        onWatchGame,
    }: {
        reason: string;
        onWatchGame?: () => void;
    }
) => {
	/**
	 * Handles the watch game button being clicked.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const handleWatchGameButtonClicked = useCallback(() => {
		onWatchGame && onWatchGame();
	}, [
        onWatchGame,
    ]);

    return (
        <div>
            {reason}
            <div>
                <FormattedMessage
                    id="quintro.components.GameJoinDialog.cannotJoinActions"
                    defaultMessage="{findGameLink} or {createGameLink}"
                    values={{
                        findGameLink: (
                            <Link
                                to="/game/find"
                                key="find-game-link"
                            >
                                <FormattedMessage
                                    id="quintro.components.GameJoinDialog.findGameLinkText"
                                    defaultMessage="Find another game"
                                />
                            </Link>
                        ),

                        createGameLink: (
                            <Link
                                to="/game/create"
                                key="create-game-link"
                            >
                                <FormattedMessage
                                    id="quintro.components.GameJoinDialog.createGameLinkText"
                                    defaultMessage="create your own!"
                                />
                            </Link>
                        ),
                    }}
                />
            </div>
            <Button
                className="watch-game-button"
                color="secondary"
                onClick={handleWatchGameButtonClicked}
            >
                <FormattedMessage
                    id="quintro.components.GameJoinDialog.buttons.watchGame.label"
                    defaultMessage="I want to watch this game"
                />
            </Button>
        </div>
    );
};

const PlayerForm = (
    {
        game,
        selectedColor,
        onSubmit,
        onCancel,
        onColorChosen,
    }: {
        game: Game;
        selectedColor: string|null;
        onSubmit: GameJoinDialogProps["onSubmit"];
        onCancel: GameJoinDialogProps["onCancel"];
        onColorChosen: (args: {color: ColorID;}) => void;
    }
) => {
	/**
	 * Handles the submit button being clicked.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

        if (!selectedColor) {
            throw new Error('Cannot join game with no color selected.');
        }

		onSubmit({
			color: selectedColor,
		});
	}, [
        onSubmit,
        selectedColor,
    ]);

    return (
        <form
            onSubmit={handleSubmit}
        >
            <div>
                <label
                >
                    <FormattedMessage
                        id="quintro.components.GameJoinDialog.color"
                        defaultMessage="Color"
                    />:
                    <ColorPicker
                        game={game}
                        selectedColor={selectedColor || undefined}
                        onColorChosen={onColorChosen}
                    />
                </label>
            </div>
            <div
            >
                <Button
                    className="submit-button"
                    type="submit"
                    color="primary"
                >
                    <FormattedMessage
                        id="quintro.components.GameJoinDialog.buttons.join.label"
                        defaultMessage="Join"
                    />
                </Button>
                <Button
                    className="cancel-button"
                    type="button"
                    onClick={onCancel}
                >
                    <FormattedMessage
                        id="quintro.components.GameJoinDialog.buttons.cancel.label"
                        defaultMessage="Cancel"
                    />
                </Button>
            </div>
        </form>
    );
};

/**
 * Component representing a dialog used to join a game.
 *
 * @memberof client.react-components
 */
export const GameJoinDialog = (
    {
        game,
        onCancel,
        onSubmit,
        onWatchGame,
    }: GameJoinDialogProps
) => {
    const intl = useIntl();
    const [selectedColor, setSelectedColor] = useState<ColorID|null>(null);

    const canAdd =  selectedColor !== null && canAddColor(game, selectedColor);

    useEffect(() => {
        if (!canAdd) {
            setSelectedColor(getDefaultColorForGame({ game }) || null)
        }
    }, [
        game,
        selectedColor,
        setSelectedColor,
    ]);

	const handleColorChosen = useCallback((
        {
            color,
        }: {
            color: ColorID;
        }
    ) => {
        setSelectedColor(color);
	}, [
        setSelectedColor,
    ]);

    const isFull = game.players.length === game.playerLimit;

    let body;
    let canJoin = false;

    if (isFull) {
        body = (<CannotJoinGameComponent
            reason={intl.formatMessage({
                id: "quintro.components.GameJoinDialog.cannotJoinReasons.gameIsFull",
                defaultMessage: "Sorry, this game is full",
            })}
            onWatchGame={onWatchGame}
        />);
    }
    else if (game.startedAtTimestamp != null) {
        body = (<CannotJoinGameComponent
            reason={intl.formatMessage({
                id: "quintro.components.GameJoinDialog.cannotJoinReasons.gameIsInProgress",
                defaultMessage: "Sorry, this game is already in progress",
            })}
            onWatchGame={onWatchGame}
        />);
    }
    else {
        body = (
            <PlayerForm
                game={game}
                onSubmit={onSubmit}
                onCancel={onCancel}
                selectedColor={selectedColor}
                onColorChosen={handleColorChosen}
            />
        );
        canJoin = true;
    }

    return (
        <Dialog
            open
        >
            <Card>
                { canJoin && (
                    <CardHeader
                        title={<FormattedMessage
                            id="quintro.components.GameJoinDialog.joinThisGamePrompt"
                            defaultMessage="Join this game"
                        />}
                    />
                ) }
                <CardContent>
                    { body }
                </CardContent>
            </Card>
        </Dialog>
    );
}
