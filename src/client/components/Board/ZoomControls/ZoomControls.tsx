import { type ChangeEvent, useCallback } from "react";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { useIntl } from "react-intl";


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
	const intl = useIntl();

	const zoomInLabel = intl.formatMessage({
		id: "quintro.components.Board.ZoomControls.zoomInLabel",
		defaultMessage: "Zoom In",
		description: "Label for the button to zoom in on the board",
	});
	
	const zoomOutLabel = intl.formatMessage({
		id: "quintro.components.Board.ZoomControls.zoomOutLabel",
		defaultMessage: "Zoom Out",
		description: "Label for the button to zoom out on the board",
	});

	const zoomLevelLabel = intl.formatMessage({
		id: "quintro.components.Board.ZoomControls.zoomLevelLabel",
		defaultMessage: "Zoom Level",
		description: "Label for the zoom level input field",
	});

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
				title={zoomOutLabel}
				aria-label={zoomOutLabel}
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
						title: zoomLevelLabel,
						"aria-label": zoomLevelLabel,
					},
				}}
				value={currentZoomLevel}
				onChange={handleInputValueChanged}
			/>
			<IconButton
				onClick={handleZoomInClicked}
				title={zoomInLabel}
				aria-label={zoomInLabel}
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
