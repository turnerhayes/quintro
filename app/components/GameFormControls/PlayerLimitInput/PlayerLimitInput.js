import React from "react";
import PropTypes from "prop-types";
import { injectIntl, intlShape } from "react-intl";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

import Config from "@app/config";

import messages from "./messages";

const styles = {
	root: {},

	inputLabel: {
		position: "static",
	},
};


/**
 * Checks whether the current state for the player limit is valid.
 *
 * @function
 *
 * @param {string} playerLimit - the player limit input value
 *
 * @return {?string} the error message, or undefined if the player limit is valid.
 */
const validatePlayerLimit = ({ playerLimit, intl }) => {
	if (playerLimit === "") {
		return intl.formatMessage(messages.isRequiredError);
	}

	const playerLimitAsNumber = Number(playerLimit);

	let error;

	if (Number.isNaN(playerLimitAsNumber)) {
		error = intl.formatMessage(messages.invalidError, {
			value: playerLimit,
		});
	}
	else {
		if (playerLimitAsNumber < Config.game.players.min) {
			error = intl.formatMessage(messages.tooSmallError, {
				value: playerLimit,
				min: Config.game.players.min,
			});
		}
		else if (playerLimitAsNumber > Config.game.players.max) {
			error = intl.formatMessage(messages.tooLargeError, {
				value: playerLimit,
				max: Config.game.players.max,
			});
		}
	}

	return error;
};


class PlayerLimitInput extends React.PureComponent {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		intl: intlShape.isRequired,
		playerLimit: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
		onPlayerLimitChange: PropTypes.func,
		error: PropTypes.string,
	}

	componentDidMount() {
		this.validateValue({ value: this.props.playerLimit });
	}

	formatMessage = (messageDescriptor, values) => {
		return this.props.intl.formatMessage(messageDescriptor, values);
	}

	validateValue = ({ value }) => {
		const error = validatePlayerLimit({
			playerLimit: value,
			intl: this.props.intl,
		});
	
		this.props.onPlayerLimitChange && this.props.onPlayerLimitChange({
			value,
			error: error || "",
		});
	}

	handleNumberOfPlayersChanged = (event) => {
		this.validateValue({ value: event.target.value });
	}

	render() {
		return (
			<div
				className={this.props.classes.root}
			>
				<TextField
					type="number"
					label={this.formatMessage(messages.label)}
					required
					error={!!this.props.error}
					helperText={this.props.error}
					inputProps={{
						min: Config.game.players.min,
						max: Config.game.players.max,
					}}
					InputLabelProps={{
						className: this.props.classes.inputLabel,
					}}
					name="playerLimit"
					value={this.props.playerLimit}
					onChange={this.handleNumberOfPlayersChanged}
				/>
			</div>
		);
	}
}

export { PlayerLimitInput as Unwrapped };

export default withStyles(styles)(injectIntl(PlayerLimitInput));
