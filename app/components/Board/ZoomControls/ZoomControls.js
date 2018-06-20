import React from "react";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { withStyles } from "@material-ui/core/styles";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ZoomInIcon from "@material-ui/icons/ZoomIn";


const styles = {
	zoomInput: {
		width: "4em",
	},

	zoomInIcon: {
		fontSize: "1.6em",
	},
};

class ZoomControls extends React.PureComponent {
	static propTypes = {
		onZoomLevelChange: PropTypes.func.isRequired,
		currentZoomLevel: PropTypes.number,
		minZoomLevel: PropTypes.number,
		maxZoomLevel: PropTypes.number,
		stepSize: PropTypes.number,
		classes: PropTypes.object.isRequired,
	}

	static defaultProps = {
		currentZoomLevel: 1,
		stepSize: 0.1,
	}

	changeZoom = ({ value, delta }) => {
		if (value === undefined) {
			value = this.props.currentZoomLevel + delta;
		}

		// istanbul ignore else
		if (!Number.isNaN(value)) {
			value = Number(value.toFixed(1));
		}

		// istanbul ignore else
		if (
			this.props.minZoomLevel !== undefined &&
			value < this.props.minZoomLevel
		) {
			value = this.props.minZoomLevel;
		}

		// istanbul ignore else
		if (
			this.props.maxZoomLevel !== undefined &&
			value > this.props.maxZoomLevel
		) {
			value = this.props.maxZoomLevel;
		}

		// istanbul ignore else
		if (value !== this.props.currentZoomLevel) {
			this.props.onZoomLevelChange(value);
		}
	}

	handleZoomOutClicked = () => {
		this.changeZoom({ delta: -1 * this.props.stepSize });
	}

	handleZoomInClicked = () => {
		this.changeZoom({ delta: this.props.stepSize });
	}

	handleInputValueChanged = ({ target }) => {
		this.changeZoom({ value: target.valueAsNumber });
	}

	render() {
		return (
			<div>
				<IconButton
					onClick={this.handleZoomOutClicked}
				>
					<ZoomOutIcon />
				</IconButton>
				<TextField
					type="number"
					classes={{
						root: this.props.classes.zoomInput,
					}}
					inputProps={{
						step: this.props.stepSize,
					}}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								x
							</InputAdornment>
						)
					}}
					value={this.props.currentZoomLevel}
					onChange={this.handleInputValueChanged}
				/>
				<IconButton
					onClick={this.handleZoomInClicked}
				>
					<ZoomInIcon
						className={this.props.classes.zoomInIcon}
					/>
				</IconButton>
			</div>
		);
	}
}

export { ZoomControls as Unwrapped };

export default withStyles(styles)(ZoomControls);
