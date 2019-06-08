import React             from "react";
import PropTypes         from "prop-types";
import {
	injectIntl,
	intlShape,
	FormattedMessage
}                        from "react-intl";
import Button            from "@material-ui/core/Button";
import { withStyles }    from "@material-ui/core/styles";

import {
	DimensionInput,
	PlayerLimitInput
}                        from "@app/components/GameFormControls";
import Config            from "@app/config";

import messages          from "./messages";

const styles = {
	dimensionSeparator: {
		margin: "0 0.5em",
		verticalAlign: "bottom",
	},

	inputLabel: {
		position: "static",
	},
};

/**
 * Component for rendering the Create a Game UI.
 *
 * @class
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
class CreateGame extends React.PureComponent {
	/**
	 * @member {object} - Component prop types
	 */
	static propTypes = {
		classes: PropTypes.object.isRequired,
		onCreateGame: PropTypes.func.isRequired,
		onToggleKeepRatio: PropTypes.func.isRequired,
		onWidthChange: PropTypes.func.isRequired,
		onHeightChange: PropTypes.func.isRequired,
		onPlayerLimitChange: PropTypes.func.isRequired,
		intl: intlShape.isRequired,
		width: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]).isRequired,
		height: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]).isRequired,
		playerLimit: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]).isRequired,
		keepRatio: PropTypes.bool.isRequired,
		widthError: PropTypes.string,
		heightError: PropTypes.string,
		playerLimitError: PropTypes.string,
	}

	static defaultProps = {
		playerLimit: "" + Config.game.players.min,
		width: "" + Config.game.board.width.min,
		height: "" + Config.game.board.height.min,
		keepRatio: false,
	}

	formatMessage = (messageDescriptor, values) => {
		return this.props.intl.formatMessage(messageDescriptor, values);
	}

	handleToggleKeepRatio = () => {
		this.props.onToggleKeepRatio({ currentValue: this.props.keepRatio });
	}

	/**
	 * Handles the game creation form being submitted.
	 *
	 * @function
	 *
	 * @param {event} event - the submit event
	 *
	 * @return {void}
	 */
	handleFormSubmit = (event) => {
		event.preventDefault();

		this.props.onCreateGame({
			width: Number(this.props.width),
			height: Number(this.props.height),
			playerLimit: Number(this.props.playerLimit),
		});
	}

	/**
	 * Generates a React component representing the creation form.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		return (
			<div>
				<h1>
					<FormattedMessage
						{...messages.header}
					/>
				</h1>
				<form
					onSubmit={this.handleFormSubmit}
				>
					<fieldset>
						<legend>
							<FormattedMessage
								{...messages.form.dimensions.label}
							/>
						</legend>
						<DimensionInput
							widthError={this.props.widthError}
							heightError={this.props.heightError}
							width={this.props.width}
							height={this.props.height}
							keepRatio={this.props.keepRatio}
							onWidthChange={this.props.onWidthChange}
							onHeightChange={this.props.onHeightChange}
							onToggleKeepRatio={this.handleToggleKeepRatio}
						/>
					</fieldset>
					<PlayerLimitInput
						playerLimit={this.props.playerLimit}
						onPlayerLimitChange={this.props.onPlayerLimitChange}
						error={this.props.playerLimitError}
					/>
					<Button
						type="submit"
						disabled={
							!!this.props.widthError ||
							!!this.props.heightError ||
							!!this.props.playerLimitError
						}
					>
						{this.formatMessage(messages.form.submitButton.label)}
					</Button>
				</form>
			</div>

		);
	}
}

export { CreateGame as Unwrapped };

export default withStyles(styles)(injectIntl(CreateGame));
