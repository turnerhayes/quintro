import React             from "react";
import PropTypes         from "prop-types";
import {
	injectIntl,
	intlShape,
	FormattedMessage
}                        from "react-intl";
import Button            from "@material-ui/core/Button";
import { withStyles }    from "@material-ui/core/styles";
import qs                from "qs";

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

const stateDefaults = {
	playerLimit: "" + Config.game.players.min,
	width: "" + Config.game.board.width.min,
	height: "" + Config.game.board.height.min,
	widthError: "",
	heightError: "",
	playerLimitError: ""
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
	 *
	 * @prop {object} location - route location, as passed by `react-router-dom`
	 *
	 * @see {@link https://reacttraining.com/react-router/web/api/location|React Router docs}
	 *	for the shape of the `location` object
	 */
	static propTypes = {
		location: PropTypes.object,
		onCreateGame: PropTypes.func.isRequired,
		intl: intlShape.isRequired,
		classes: PropTypes.object.isRequired,
	}

	constructor(...args) {
		super(...args);

		this.state = Object.assign(
			{},
			stateDefaults,
			CreateGame.getStateFromQuery(this.props)
		);
	}

	formatMessage = (messageDescriptor, values) => {
		return this.props.intl.formatMessage(messageDescriptor, values);
	}

	/**
	 * Component state
	 *
	 * @member state
	 * @type object
	 *
	 * @prop {string} playerLimit=configuration minimum - the maximum number of players that will
	 *	be able to play the	game
	 * @prop {string} width=configuration minimum - the width of the game board. Defaults to the
	 *	app-wide configured minimum.
	 * @prop {string} height=configuration minimum - the height of the game board. Defaults to the
	 *	app-wide configured minimum.
	 * @prop {string} widthError="" - the error message to show for the entered width (if applicable)
	 * @prop {string} heightError="" - the error message to show for the entered height (if applicable)
	 * @prop {string} playerLimitError="" - the error message to show for the entered player limit (if applicable)
	 */

	/**
	 * Sets the component state from the location's query string, if it is not empty.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	static getStateFromQuery = (props) => {
		if (!props.location.search) {
			return;
		}

		const query = qs.parse(props.location.search.replace(/^\?/, ""));

		// if any are NaN, let it use the defaults
		if (Number.isNaN(Number(query.width))) {
			delete query.width;
		}

		if (Number.isNaN(Number(query.height))) {
			delete query.height;
		}

		if (Number.isNaN(Number(query.playerLimit))) {
			delete query.playerLimit;
		}

		return query;
	}

	static getDerivedStateFromProps(props, state) {
		/* istanbul ignore else */
		if (props.location.search !== state.previousSearch) {
			return {
				...CreateGame.getStateFromQuery(props),
				previousSearch: props.location.search,
			};
		}

		return null;
	}

	handleWidthChange = ({ error, value }) => {
		this.setState({
			width: value,
			widthError: error,
		});
	}

	handleHeightChange = ({ error, value }) => {
		this.setState({
			height: value,
			heightError: error,
		});
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
			width: Number(this.state.width),
			height: Number(this.state.height),
			playerLimit: Number(this.state.playerLimit),
		});
	}

	handlePlayerLimitChange = ({ value, error }) => {
		this.setState({
			playerLimit: value,
			playerLimitError: error,
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
							widthError={this.state.widthError}
							heightError={this.state.heightError}
							width={this.state.width}
							height={this.state.height}
							onWidthChange={this.handleWidthChange}
							onHeightChange={this.handleHeightChange}
						/>
					</fieldset>
					<PlayerLimitInput
						playerLimit={this.state.playerLimit}
						onPlayerLimitChange={this.handlePlayerLimitChange}
						error={this.state.playerLimitError}
					/>
					<Button
						type="submit"
						disabled={
							!!this.state.widthError ||
							!!this.state.heightError ||
							!!this.state.playerLimitError
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
