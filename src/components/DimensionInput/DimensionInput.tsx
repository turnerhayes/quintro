import { type ChangeEvent, useCallback, useEffect } from "react";
import { FormattedMessage, type IntlShape, useIntl } from "react-intl";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import LinkIcon from "@mui/icons-material/Link";
import Stack from "@mui/material/Stack";

import Config from "@/config";

import styles from "./DimensionInput.module.css";


type Dimension = "width"|"height";

const TEXT_FIELD_WIDTH = "5em";

/**
 * Checks whether the current state for the specified board dimension is valid.
 *
 * @function
 *
 * @param {"width"|"height"} dimension - the dimension to check
 * @param {string} value - the value for the dimension
 *
 * @return {?string} the error message, or undefined if the dimension is valid.
 */
const validateDimension = (
    {
        dimension, value, intl
    }: {
        dimension: Dimension;
        value: string;
        intl: IntlShape;
    }
) => {
	if (value === "") {
		return intl.formatMessage({
            id: "quintro.general.form.isRequired",
            defaultMessage: "This field is required",
        });
	}

	const valueAsNumber = Number(value);

	if (Number.isNaN(valueAsNumber)) {
        if (dimension === "width") {
            return intl.formatMessage({
                id: "quintro.components.GameFormControls.DimensionInput.errors.width.invalid",
                defaultMessage: "{value} is not a valid value for the width",
            }, {
                value,
            });
        }
        else {
            return intl.formatMessage({
                id: "quintro.components.GameFormControls.DimensionInput.errors.height.invalid",
                defaultMessage: "{value} is not a valid value for the height",
            }, {
                value,
            });
        }
	}

    if (dimension === "width") {
        if (valueAsNumber < Config.game.board.width.min) {
            return intl.formatMessage({
                id: "quintro.components.GameFormControls.DimensionInput.errors.width.tooSmall",
                defaultMessage: "{value} is less than the minimum width ({min})",

            }, {
                value: valueAsNumber,
                min: Config.game.board.width.min,
            });
        }
	}
    else {
        if (valueAsNumber < Config.game.board.height.min) {
            return intl.formatMessage({
                id: "quintro.components.GameFormControls.DimensionInput.errors.height.tooSmall",
                defaultMessage: "{value} is less than the minimum height ({min})",
    
            }, {
                value: valueAsNumber,
                min: Config.game.board.height.max,
            });
        }
    }
	
    if (dimension === "width") {
        if (valueAsNumber > Config.game.board.height.max) {
            return intl.formatMessage({
                id: "quintro.components.GameFormControls.DimensionInput.errors.width.tooLarge",
                defaultMessage: "{value} is greater than the maximum width ({max})",
            }, {
                value: valueAsNumber,
                max: Config.game.board.height.min,
            });
        }
	}
    else {
        if (valueAsNumber > Config.game.board.height.max) {
            return intl.formatMessage({
                id: "quintro.components.GameFormControls.DimensionInput.errors.height.tooLarge",
                defaultMessage: "{value} is greater than the maximum height ({max})",
            }, {
                value: valueAsNumber,
                max: Config.game.board.height.max,
            });
        }
    }

	return null;
};

const ToggleKeepRatioButton = (
    {
        keepRatio,
        onToggleKeepRatio,
    }: {
        keepRatio: boolean;
        onToggleKeepRatio: () => void;
    }
) => {
    const intl = useIntl();

    return (
        <IconButton
            className={styles.keepRatioButton}
            area-pressed={keepRatio ? "true" : undefined}
            color={keepRatio ? "primary" : "default"}
            value=""
            onClick={onToggleKeepRatio}
            size="small"
            title={
                keepRatio ? (
                    intl.formatMessage({
                        id: "quintro.components.GameFormControls.DimensionInput.keepRatio.unlock",
                        defaultMessage: "Unlock ratio",
                    })
                ) : (
                    intl.formatMessage({
                        id: "quintro.components.GameFormControls.DimensionInput.keepRatio.lock",
                        defaultMessage: "Lock ratio",
                    })
                )
            }
        >
            <LinkIcon />
        </IconButton>
    );
};

export const DimensionInput = (
    {
        width,
        height,
        keepRatio,
        onWidthChange,
        onHeightChange,
        onToggleKeepRatio,
        widthError,
        heightError,
    }: {
        width: string|number;
        height: string|number;
        keepRatio: boolean;
        onWidthChange: (params: {value: string; error: string|null;}) => void;
        onHeightChange: (params: {value: string; error: string|null;}) => void;
        onToggleKeepRatio?: () => void;
        widthError?: string;
        heightError?: string;
    }
) => {
    const intl = useIntl();
    const handleDimensionInputChange = useCallback((dimension: Dimension, value: string) => {
        const error = validateDimension({
            dimension,
			value,
			intl,
		});
        
		if (dimension === "width") {
            onWidthChange({ value, error });
            
			if (keepRatio && !error) {
                const currentWidthNumber = Number(width);
				const currentHeightNumber = Number(height);
                
				if (!Number.isNaN(currentWidthNumber) && !Number.isNaN(currentHeightNumber)) {
                    const valueNumber = Number(value);
					const newHeight = Math.round((valueNumber / currentWidthNumber) * currentHeightNumber);
                    
					if (newHeight !== currentHeightNumber) {
                        onHeightChange({ value: newHeight + "", error: null });
					}
				}
			}
		}
        
		if (dimension === "height") {
            onHeightChange({ value, error });
            
			if (keepRatio && !error) {
                const currentWidthNumber = Number(width);
				const currentHeightNumber = Number(height);
                
				if (!Number.isNaN(currentWidthNumber) && !Number.isNaN(currentHeightNumber)) {
                    const valueNumber = Number(value);
					const newWidth = Math.round((valueNumber / currentHeightNumber) * currentHeightNumber);
                    
					if (newWidth !== currentWidthNumber) {
                        onWidthChange({ value: newWidth + "", error: null });
					}
				}
			}
		}
	}, [
        width,
        height,
        keepRatio,
        onWidthChange,
        onHeightChange,
    ]);

    useEffect(() => {
        handleDimensionInputChange("width", width + "");
        handleDimensionInputChange("height", height + "");
    }, []);

	const handleWidthChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        handleDimensionInputChange("width", event.target.value);
	}, [
        handleDimensionInputChange,
    ]);

	const handleHeightChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		handleDimensionInputChange("height", event.target.value);
	}, [
        handleDimensionInputChange,
    ]);

	const toggleKeepRatio = useCallback(() => {
		onToggleKeepRatio && onToggleKeepRatio();
	}, [
        onToggleKeepRatio,
    ]);
	
    return (
        <Stack
            direction="row"
            className={styles.root}
        >
            <TextField
                type="number"
                label={
                    <FormattedMessage
                        id="quintro.components.GameFormControls.DimensionInput.width.label"
                        defaultMessage="Width"
                    />
                }
                size="small"
                sx={{
                    width: TEXT_FIELD_WIDTH,
                }}
                required
                error={!!widthError}
                helperText={widthError}
                slotProps={{
                    htmlInput: {
                        max: Config.game.board.width.max,
                        min: Config.game.board.width.min,
                    },

                    inputLabel: {
                        className: styles.inputLabel,
                    },
                }}
                name="width"
                value={width}
                onChange={handleWidthChange}
            />
            
            <span
                className={styles.dimensionSeparator}
            >×</span>

            <TextField
                type="number"
                label={
                    <FormattedMessage
                        id="quintro.components.GameFormControls.DimensionInput.height.label"
                        defaultMessage="Height"
                    />
                }
                size="small"
                sx={{
                    width: TEXT_FIELD_WIDTH,
                }}
                required
                error={!!heightError}
                helperText={heightError}
                slotProps={{
                    htmlInput: {
                        min: Config.game.board.height.min,
                        max: Config.game.board.height.max,
                    },

                    inputLabel: {
                        className: styles.inputLabel,
                    },
                }}
                name="height"
                value={height}
                onChange={handleHeightChange}
            />

            <ToggleKeepRatioButton
                keepRatio={keepRatio}
                onToggleKeepRatio={toggleKeepRatio}
            />
        </Stack>
    );
}
