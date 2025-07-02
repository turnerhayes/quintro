import React, { ChangeEvent, useCallback } from "react";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomIn";


type ChangeZoomArgs = {
	value: number;
	delta?: never;
} | {
	value?: never;
	delta: number;
};

export interface ZoomControlsProps {
	currentZoomLevel?: number;
	stepSize?: number;
	minZoomLevel: number;
	maxZoomLevel: number;
	onZoomLevelChange: (zoomLevel: number) => void;
	className?: string;
}

export const ZoomControls = (
	{
		currentZoomLevel = 1,
		stepSize = 0.1,
		minZoomLevel,
		maxZoomLevel,
		onZoomLevelChange,
		className,
	}: ZoomControlsProps
) => {
	const changeZoom = useCallback(
		({ value, delta }: ChangeZoomArgs) => {
			let _value: number;
			if (value === undefined) {
				_value = currentZoomLevel + delta;
			}
			else {
				_value = value;
			}

			// istanbul ignore else
			if (!Number.isNaN(_value)) {
				const digitsToRight = Math.floor(Math.log10(stepSize));

				const roundFactor = digitsToRight < 0 ?
					-1 * digitsToRight :
					0;
				_value = Number(_value.toFixed(roundFactor));
			}

			// istanbul ignore else
			if (
				minZoomLevel !== undefined &&
				_value < minZoomLevel
			) {
				_value = minZoomLevel;
			}

			// istanbul ignore else
			if (
				maxZoomLevel !== undefined &&
				_value > maxZoomLevel
			) {
				_value = maxZoomLevel;
			}

			// istanbul ignore else
			if (_value !== currentZoomLevel) {
				onZoomLevelChange(_value);
			}
		},
		[
			currentZoomLevel,
			minZoomLevel,
			maxZoomLevel,
			stepSize,
			onZoomLevelChange,
		]
	);

	const handleZoomOutClicked = useCallback(
		() => {
			changeZoom({ delta: -1 * stepSize });
		},
		[
			changeZoom,
			stepSize,
		]
	);

	const handleZoomInClicked = useCallback(
		() => {
			changeZoom({ delta: stepSize });
		},
		[
			changeZoom,
		]
	);

	const handleInputValueChanged = useCallback(
		({ target }: ChangeEvent<HTMLInputElement>) => {
			changeZoom({ value: target.valueAsNumber });
		},
		[
			changeZoom,
		]
	);

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
				sx={{
					width: "4.3em",
				}}
				slotProps={{
					htmlInput: {
						step: stepSize,
					},
				}}
				value={currentZoomLevel}
				onChange={handleInputValueChanged}
			/>
			<IconButton
				onClick={handleZoomInClicked}
			>
				<ZoomInIcon
					sx={{
						fontSize: "1.6em",
					}}
				/>
			</IconButton>
		</div>
	);
}
