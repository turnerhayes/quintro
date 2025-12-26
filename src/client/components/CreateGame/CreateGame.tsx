import { type FormEvent, useCallback, useEffect, useState }             from "react";
import {
	FormattedMessage
}                        from "react-intl";
import { useNavigate } from "react-router";
import Button            from "@mui/material/Button";
import Box               from "@mui/material/Box";
import Stack             from "@mui/material/Stack";

import {
	DimensionInput,
}                        from "@/client/components/DimensionInput";
import {
	PlayerLimitInput
}                        from "@/client/components/PlayerLimitInput";
import { useCreateGameMutation }    from "@/client/api/games";
import Config from "@/config";


/**
 * Component for rendering the Create a Game UI.
 */
export const CreateGame = () => {
    const [width, setWidth] = useState(Config.game.board.width.min.toString());
    const [height, setHeight] = useState(Config.game.board.height.min.toString());
    const [widthError, setWidthError] = useState<string|null>(null);
    const [heightError, setHeightError] = useState<string|null>(null);
    const [playerLimit, setPlayerLimit] = useState(Config.game.players.min.toString());
    const [playerLimitError, setPlayerLimitError] = useState<string|null>(null);
    const [keepRatio, setKeepRatio] = useState(false);
    const [
        createGame,
        {
            error: createGameError,
            isSuccess: createGameSuccess,
            data: gameName,
        }
    ] = useCreateGameMutation();

    const navigate = useNavigate();

    const handleWidthChange = useCallback((
        {
            value,
            error,
        }: {
            value: string;
            error: string|null;
        }
    ) => {
        setWidth(value);
        setWidthError(error);
    }, [
        setWidth,
        setWidthError,
    ]);

    const handleHeightChange = useCallback((
        {
            value,
            error,
        }: {
            value: string;
            error: string|null;
        }
    ) => {
        setHeight(value);
        setHeightError(error);
    }, [
        setHeight,
        setHeightError,
    ]);

	const handleToggleKeepRatio = useCallback(() => {
		setKeepRatio(!keepRatio);
	}, [
        keepRatio,
        setKeepRatio,
    ]);

    const handlePlayerLimitChange = useCallback((
        {
            value,
            error,
        }: {
            value: string;
            error: string|null;
        }
    ) => {
        setPlayerLimit(value);
        setPlayerLimitError(error);
    }, [
        setPlayerLimit,
        setPlayerLimitError,
    ]);

	const handleFormSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

        await createGame({
            width: Number(width),
            height: Number(height),
            playerLimit: Number(playerLimit),
        });
	}, [
        width,
        height,
        playerLimit,
        navigate,
    ]);    

    useEffect(() => {
        if (createGameSuccess && gameName) {
            navigate(`/game/play/${gameName}`);
        }   
    }, [
        createGameSuccess,
        gameName,
    ]);

    if (createGameSuccess) {
        return null;
    }

    return (
        <div>
            <h1>
                <FormattedMessage
                    id="quintro.components.CreateGame.header"
                    defaultMessage="Create a Game"
                />
            </h1>
            {createGameError != undefined && (
                <Box
                    sx={{
                        color: "error.main",
                        marginBottom: "1rem",
                    }}
                >
                    <FormattedMessage
                        id="quintro.components.CreateGame.error"
                        defaultMessage="Error creating game. Please try again later."
                    />
                </Box>
            )}
            <Stack
                component="form"
                onSubmit={handleFormSubmit}
            >
                <Box
                    component="fieldset"
                >
                    <legend>
                        <FormattedMessage
                            id="quintro.components.CreateGame.form.dimensions.label"
                            defaultMessage="Dimensions"
                        />
                    </legend>
                    <DimensionInput
                        widthError={widthError || undefined}
                        heightError={heightError || undefined}
                        width={width}
                        height={height}
                        keepRatio={keepRatio}
                        onWidthChange={handleWidthChange}
                        onHeightChange={handleHeightChange}
                        onToggleKeepRatio={handleToggleKeepRatio}
                    />
                </Box>
                <Box
                    sx={{
                        marginTop: "1rem",
                    }}
                >
                    <PlayerLimitInput
                        playerLimit={playerLimit}
                        onPlayerLimitChange={handlePlayerLimitChange}
                        error={playerLimitError ?? undefined}
                    />
                </Box>
                <Button
                    type="submit"
                    disabled={
                        !!widthError ||
                        !!heightError ||
                        !!playerLimitError
                    }
                >
                    <FormattedMessage
                        id="quintro.components.CreateGame.form.submitButton.label"
                        defaultMessage="Create"
                    />
                </Button>
            </Stack>
        </div>
    );
}
