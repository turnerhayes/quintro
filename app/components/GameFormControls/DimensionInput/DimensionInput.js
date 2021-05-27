import React from "react";
import PropTypes from "prop-types";
import { injectIntl, intlShape } from "react-intl";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import ToggleButton from "@material-ui/lab/ToggleButton";
import LinkIcon from "@material-ui/icons/Link";

import Config from "@app/config";

import messages from "./messages";

const styles = {
	root: {
		display: "flex",
		flexDirection: "row",
	},

	dimensionSeparator: {
		margin: "0 0.5em",
		alignSelf: "flex-end",
	},

	inputLabel: {
		position: "static",
	},

	keepRatioButton: {
		alignSelf: "center",
	},
};


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
const validateDimension = ({ dimension, value, intl }) => {
	if (value === "") {
		return intl.formatMessage(messages.isRequiredError);
	}

	const valueAsNumber = Number(value);

	if (Number.isNaN(valueAsNumber)) {
		const messageId = dimension === "height" ?
			messages.heightInvalidError :
			messages.widthInvalidError;
		return intl.formatMessage(messageId, {
			dimension,
			value,
		});
	}

	if (valueAsNumber < Config.game.board[dimension].min) {
		const messageId = dimension === "height" ?
			messages.heightTooSmallError :
			messages.widthTooSmallError;
		return intl.formatMessage(messageId, {
			dimension,
			value: valueAsNumber,
			min: Config.game.board[dimension].min,
		});
	}
	
	if (valueAsNumber > Config.game.board[dimension].max) {
		const messageId = dimension === "height" ?
			messages.heightTooLargeError :
			messages.widthTooLargeError;
		return intl.formatMessage(messageId, {
			dimension,
			value: valueAsNumber,
			max: Config.game.board[dimension].max,
		});
	}

	return null;
};


class DimensionInput extends React.PureComponent {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		intl: intlShape.isRequired,
		width: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number
		]).isRequired,
		height: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number
		]).isRequired,
		widthError: PropTypes.string,
		heightError: PropTypes.string,
		keepRatio: PropTypes.bool,
		onWidthChange: PropTypes.func.isRequired,
		onHeightChange: PropTypes.func.isRequired,
		onToggleKeepRatio: PropTypes.func.isRequired,
	}

	static defaultProps = {
		keepRatio: false,
	}

	componentDidMount() {
		this.handleDimensionInputChange("width", this.props.width);
		this.handleDimensionInputChange("height", this.props.height);
	}

	formatMessage = (messageDescriptor, values) => {
		return this.props.intl.formatMessage(messageDescriptor, values);
	}

	/**
	 * Handles changes to a board dimension input field.
	 *
	 * @function
	 *
	 * @param {"width"|"height"} dimension - the name of the dimension being changed
	 * @param {string} value - the value to change the dimension to
	 *
	 * @return {void}
	 */
	handleDimensionInputChange = (dimension, value) => {
		const error = validateDimension({
			dimension,
			value,
			intl: this.props.intl,
		});

		if (dimension === "width") {
			this.props.onWidthChange({ value, error });

			if (this.props.keepRatio && !error) {
				const currentWidthNumber = Number(this.props.width);
				const currentHeightNumber = Number(this.props.height);

				if (!Number.isNaN(currentWidthNumber) && !Number.isNaN(currentHeightNumber)) {
					const valueNumber = Number(value);
					const newHeight = Math.round((valueNumber / currentWidthNumber) * currentHeightNumber);
	
					if (newHeight !== currentHeightNumber) {
						this.props.onHeightChange({ value: newHeight + "", error: null });
					}
				}
			}
		}

		if (dimension === "height") {
			this.props.onHeightChange({ value, error });

			if (this.props.keepRatio && !error) {
				const currentWidthNumber = Number(this.props.width);
				const currentHeightNumber = Number(this.props.height);

				if (!Number.isNaN(currentWidthNumber) && !Number.isNaN(currentHeightNumber)) {
					const valueNumber = Number(value);
					const newWidth = Math.round((valueNumber / currentHeightNumber) * currentHeightNumber);
	
					if (newWidth !== currentWidthNumber) {
						this.props.onWidthChange({ value: newWidth + "", error: null });
					}
				}
			}
		}
	}

	handleWidthChange = (event) => {
		this.handleDimensionInputChange("width", event.target.value);
	}

	handleHeightChange = (event) => {
		this.handleDimensionInputChange("height", event.target.value);
	}

	toggleKeepRatio = () => {
		this.props.onToggleKeepRatio && this.props.onToggleKeepRatio();
	}
	
	render() {
		return (
			<div
				className={this.props.classes.root}
			>
				<TextField
					type="number"
					label={this.formatMessage(messages.widthLabel)}
					required
					error={!!this.props.widthError}
					helperText={this.props.widthError}
					inputProps={{
						max: Config.game.board.width.max,
						min: Config.game.board.width.min,
					}}
					InputLabelProps={{
						className: this.props.classes.inputLabel,
					}}
					name="width"
					value={this.props.width}
					onChange={this.handleWidthChange}
				/>
				
				<span
					className={this.props.classes.dimensionSeparator}
				>×</span>
	
				<TextField
					type="number"
					label={this.formatMessage(messages.heightLabel)}
					required
					error={!!this.props.heightError}
					helperText={this.props.heightError}
					inputProps={{
						min: Config.game.board.height.min,
						max: Config.game.board.height.max,
					}}
					InputLabelProps={{
						className: this.props.classes.inputLabel,
					}}
					name="height"
					value={this.props.height}
					onChange={this.handleHeightChange}
				/>

				<ToggleButton
					className={this.props.classes.keepRatioButton}
					selected={this.props.keepRatio}
					value=""
					onClick={this.toggleKeepRatio}
					title={this.formatMessage(
						this.props.keepRatio ?
							messages.unlockKeepRatio :
							messages.lockKeepRatio
					)}
				>
					<LinkIcon />
				</ToggleButton>
			</div>
		);
	}
}

export { DimensionInput as Unwrapped };

export default withStyles(styles)(injectIntl(DimensionInput));
