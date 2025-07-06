import { type ChangeEvent, useCallback, useEffect } from "react";
import { FormattedMessage, type IntlShape, useIntl } from "react-intl";
import TextField from "@mui/material/TextField";

import Config from "@/config";
import styles from "./PlayerLimitInput.module.css";


/**
 * Checks whether the current state for the player limit is valid.
 *
 * @function
 *
 * @param playerLimit - the player limit input value
 *
 * @return {?string} the error message, or undefined if the player limit is valid.
 */
const validatePlayerLimit = (
    {
        playerLimit,
        intl,
    }: {
        playerLimit: string;
        intl: IntlShape;
    }
): string|undefined => {
	if (playerLimit === "") {
		return intl.formatMessage({
            id: "quintro.general.form.isRequired",
            defaultMessage: "This field is required",
        });
	}

	const playerLimitAsNumber = Number(playerLimit);

	let error;

	if (Number.isNaN(playerLimitAsNumber)) {
		error = intl.formatMessage({
            id: "quintro.components.GameFormControls.PlayerLimitInput.errors.invalid",
            defaultMessage: "{value} is not a valid value for the player limit",
        }, {
			value: playerLimit,
		});
	}
	else {
		if (playerLimitAsNumber < Config.game.players.min) {
			error = intl.formatMessage({
                id: "quintro.components.GameFormControls.PlayerLimitInput.errors.tooSmall",
                defaultMessage: "{value} is less than the minimum number of players ({min})",
            }, {
				value: playerLimit,
				min: Config.game.players.min,
			});
		}
		else if (playerLimitAsNumber > Config.game.players.max) {
			error = intl.formatMessage({
                id: "quintro.components.GameFormControls.PlayerLimitInput.errors.tooLarge",
                defaultMessage: "{value} is greater than the maximum number of players ({max})",
            }, {
				value: playerLimit,
				max: Config.game.players.max,
			});
		}
	}

	return error;
};


export const PlayerLimitInput = (
    {
        playerLimit,
        error,
        onPlayerLimitChange,
    }: {
        playerLimit: string;
        error: string|null;
        onPlayerLimitChange?: (args: {value: string; error: string|null}) => void;
    }
) => {
    const intl = useIntl();

	useEffect(() => {
		validateValue(playerLimit);
	}, []);

	const validateValue = useCallback((value: string) => {
		const error = validatePlayerLimit({
			playerLimit: value,
			intl,
		});
	
		onPlayerLimitChange && onPlayerLimitChange({
			value,
			error: error || "",
		});
	}, [
        intl,
        onPlayerLimitChange,
    ]);

	const handleNumberOfPlayersChanged = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		validateValue(event.target.value);
	}, [
        validateValue,
    ]);

    return (
        <div>
            <TextField
                type="number"
                label={
                    <FormattedMessage
                        id="quintro.components.GameFormControls.PlayerLimitInput.label"
                        defaultMessage="Number of players"
                    />
                }
                size="small"
                required
                error={!!error}
                helperText={error}
                slotProps={{
                    htmlInput: {
                        min: Config.game.players.min,
                        max: Config.game.players.max,
                    },
                    inputLabel: {
                        className: styles.inputLabel,
                    },
                }}
                name="playerLimit"
                value={playerLimit}
                onChange={handleNumberOfPlayersChanged}
            />
        </div>
    );
}
