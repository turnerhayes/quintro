import React, { useCallback } from "react";
import PropTypes from "prop-types";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { withStyles } from "@mui/material/styles";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomIn";


const styles = {
	zoomInput: {
		width: "4em",
	},

	zoomInIcon: {
		fontSize: "1.6em",
	},
};


interface ZoomControlsProps {
	currentZoomLevel?: number;
	minZoomLevel: number;
	maxZoomLevel: number;
	stepSize?: number;
	onZoomLevelChange: (value: number) => void;
	className: string;
	classes?: {
		zoomInput: string;
		zoomInIcon: string;
	};
}

const ZoomControls = ({
	currentZoomLevel = 1,
	minZoomLevel,
	maxZoomLevel,
	stepSize = 0.1,
	onZoomLevelChange,
	className,
	classes = {
		zoomInIcon: "",
		zoomInput: "",
	},
}: ZoomControlsProps) => {

	const changeZoom = useCallback(({
		value,
		delta,
	}: {
		value?: number;
		delta?: number;
	}) => {
		if (value === undefined) {
			value = currentZoomLevel + delta;
		}

		// istanbul ignore else
		if (!Number.isNaN(value)) {
			const digitsToRight = Math.floor(Math.log10(stepSize));

			const roundFactor = digitsToRight < 0 ?
				-1 * digitsToRight :
				0;
			value = Number(value.toFixed(roundFactor));
		}

		// istanbul ignore else
		if (
			minZoomLevel !== undefined &&
			value < minZoomLevel
		) {
			value = minZoomLevel;
		}

		// istanbul ignore else
		if (
			maxZoomLevel !== undefined &&
			value > maxZoomLevel
		) {
			value = maxZoomLevel;
		}

		// istanbul ignore else
		if (value !== currentZoomLevel) {
			onZoomLevelChange(value);
		}
	}, [onZoomLevelChange, currentZoomLevel, minZoomLevel, maxZoomLevel]);

	const handleZoomOutClicked = useCallback(() => {
		changeZoom({ delta: -1 * stepSize });
	}, [changeZoom, stepSize]);

	const handleZoomInClicked = useCallback(() => {
		changeZoom({ delta: stepSize });
	}, [changeZoom, stepSize]);

	const handleInputValueChanged = useCallback(({ target }) => {
		changeZoom({ value: target.valueAsNumber });
	}, [changeZoom]);

	return (
		<div
			className={className}
		>
			<IconButton
				onClick={handleZoomOutClicked}
			>
				<ZoomOutIcon />
			</IconButton>
			<TextField
				type="number"
				classes={{
					root: classes.zoomInput,
				}}
				inputProps={{
					step: stepSize,
				}}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							x
						</InputAdornment>
					)
				}}
				value={currentZoomLevel}
				onChange={handleInputValueChanged}
			/>
			<IconButton
				onClick={handleZoomInClicked}
			>
				<ZoomInIcon
					className={classes.zoomInIcon}
				/>
			</IconButton>
		</div>
	);
}

export { ZoomControls as Unwrapped };

export default ZoomControls;

// export default withStyles(styles)(ZoomControls);
