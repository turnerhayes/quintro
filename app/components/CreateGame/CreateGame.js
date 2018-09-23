import debounce          from "lodash/debounce";
import React             from "react";
import PropTypes         from "prop-types";
import {
	injectIntl,
	intlShape,
	FormattedMessage
}                        from "react-intl";
import TextField         from "@material-ui/core/TextField";
import Button            from "@material-ui/core/Button";
import { withStyles }    from "@material-ui/core/styles";
import qs                from "qs";
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

export const CHECK_NAME_DEBOUCE_DURATION_IN_MILLISECONDS = 500;


const stateDefaults = {
	name: "",
	playerLimit: "" + Config.game.players.min,
	width: "" + Config.game.board.width.min,
	height: "" + Config.game.board.height.min,
	nameError: "",
	widthError: "",
	heightError: "",
	playerLimitError: ""
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
		return intl.formatMessage(messages.form.errors.general.isRequired);
	}

	value = Number(value);

	if (Number.isNaN(value)) {
		return intl.formatMessage(messages.form.errors.dimensions.invalid, {
			dimension,
			value,
		});
	}

	if (value < Config.game.board[dimension].min) {
		return intl.formatMessage(messages.form.errors.dimensions.tooSmall, {
			dimension,
			value,
			min: Config.game.board[dimension].min,
		});
	}
	
	if (value > Config.game.board[dimension].max) {
		return intl.formatMessage(messages.form.errors.dimensions.tooLarge, {
			dimension,
			value,
			max: Config.game.board[dimension].max,
		});
	}

	return undefined;
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
		return intl.formatMessage(messages.form.errors.general.isRequired);
	}

	const playerLimitAsNumber = Number(playerLimit);

	let error;

	if (Number.isNaN(playerLimitAsNumber)) {
		error = intl.formatMessage(messages.form.errors.playerLimit.invalid, {
			value: playerLimit,
		});
	}
	else {
		if (playerLimitAsNumber < Config.game.players.min) {
			error = intl.formatMessage(messages.form.errors.playerLimit.tooSmall, {
				value: playerLimit,
				min: Config.game.players.min,
			});
		}
		else if (playerLimitAsNumber > Config.game.players.max) {
			error = intl.formatMessage(messages.form.errors.playerLimit.tooLarge, {
				value: playerLimit,
				max: Config.game.players.max,
			});
		}
	}

	return error;
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
		isNameValid: PropTypes.bool.isRequired,
		onCreateGame: PropTypes.func.isRequired,
		onCheckName: PropTypes.func.isRequired,
		intl: intlShape.isRequired,
		classes: PropTypes.object.isRequired,
	}

	static defaultProps = {
		isNameValid: false,
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
	 * @prop {string} name="" - the name to give the game
	 * @prop {string} playerLimit=configuration minimum - the maximum number of players that will
	 *	be able to play the	game
	 * @prop {string} width=configuration minimum - the width of the game board. Defaults to the
	 *	app-wide configured minimum.
	 * @prop {string} height=configuration minimum - the height of the game board. Defaults to the
	 *	app-wide configured minimum.
	 * @prop {string} nameError="" - the error message to show for the entered name (if applicable)
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

		if (query.width) {
			query.widthError = validateDimension({
				dimension: "width",
				value: query.width,
				intl: props.intl,
			}) || "";
		}

		if (query.height) {
			query.heightError = validateDimension({
				dimension: "height",
				value: query.height,
				intl: props.intl,
			}) || "";
		}

		if (query.playerLimit) {
			query.playerLimitError = validatePlayerLimit({
				playerLimit: query.playerLimit,
				intl: props.intl,
			}) || "";
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

	/**
	 * Handles changes to the game name input field.
	 *
	 * @function
	 *
	 * @param {event} event - the change event
	 *
	 * @return {void}
	 */
	handleNameInputChange = (event) => {
		this.setState({
			name: event.target.value,
			nameError: ""
		});

		this.debouncedCheckName();
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

		this.setState({
			[dimension]: value,
			[`${dimension}Error`]: error || "",
		});
	}

	handleWidthChange = (event) => {
		this.handleDimensionInputChange("width", event.target.value);
	}

	handleHeightChange = (event) => {
		this.handleDimensionInputChange("height", event.target.value);
	}

	/**
	 * Checks to see whether the name value in the current state is already being used.
	 *
	 * @function
	 */
	checkName = () => {
		this.props.onCheckName({ name: this.state.name });
	}

	debouncedCheckName = debounce(this.checkName, CHECK_NAME_DEBOUCE_DURATION_IN_MILLISECONDS)

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

		// Don't bother calling any debounced checkNames, since we're manually calling it again
		this.debouncedCheckName.cancel();

		this.props.onCreateGame({
			name: this.state.name,
			width: Number(this.state.width),
			height: Number(this.state.height),
			playerLimit: Number(this.state.playerLimit),
		});
	}

	handleNumberOfPlayersChanged = (event) => {
		const playerLimit = event.target.value;
		const error = validatePlayerLimit({
			playerLimit,
			intl: this.props.intl,
		});

		this.setState({
			playerLimit,
			playerLimitError: error || "",
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
					<div
					>
						<TextField
							required
							label={this.formatMessage(messages.form.name.label)}
							error={this.state.name.length > 0 && !this.props.isNameValid}
							helperText={
								this.state.name.length === 0 || this.props.isNameValid ?
									"" :
									this.formatMessage(messages.form.errors.nameInUse)
							}
							name="name"
							value={this.state.name}
							onChange={this.handleNameInputChange}
						/>
					</div>
					<fieldset>
						<legend>
							<FormattedMessage
								{...messages.form.dimensions.label}
							/>
						</legend>
						<TextField
							type="number"
							label={this.formatMessage(messages.form.width.label)}
							required
							error={!!this.state.widthError}
							helperText={this.state.widthError}
							inputProps={{
								max: Config.game.board.width.max,
								min: Config.game.board.width.min,
							}}
							InputLabelProps={{
								className: this.props.classes.inputLabel,
							}}
							name="width"
							value={this.state.width}
							onChange={this.handleWidthChange}
						/>
						
						<span
							className={this.props.classes.dimensionSeparator}
						>×</span>

						<TextField
							type="number"
							label={this.formatMessage(messages.form.height.label)}
							required
							error={!!this.state.heightError}
							helperText={this.state.heightError}
							inputProps={{
								min: Config.game.board.height.min,
								max: Config.game.board.height.max,
							}}
							InputLabelProps={{
								className: this.props.classes.inputLabel,
							}}
							name="height"
							value={this.state.height}
							onChange={this.handleHeightChange}
						/>
					</fieldset>
					<div>
						<TextField
							type="number"
							label={this.formatMessage(messages.form.playerLimit.label)}
							required
							error={!!this.state.playerLimitError}
							helperText={this.state.playerLimitError}
							inputProps={{
								min: Config.game.players.min,
								max: Config.game.players.max,
							}}
							InputLabelProps={{
								className: this.props.classes.inputLabel,
							}}
							name="playerLimit"
							value={this.state.playerLimit}
							onChange={this.handleNumberOfPlayersChanged}
						/>
					</div>
					<Button
						type="submit"
						disabled={
							!this.props.isNameValid ||
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
