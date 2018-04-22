import debounce          from "lodash/debounce";
import React             from "react";
import PropTypes         from "prop-types";
import {
	injectIntl,
	intlShape,
	FormattedMessage
}                        from "react-intl";
import TextField         from "material-ui/TextField";
import Button            from "material-ui/Button";
import qs                from "qs";
import Config            from "@app/config";
import createClassHelper from "@app/components/class-helper";
import messages          from "./messages";
import                        "./CreateGame.less";


const classes = createClassHelper("create-game");

export const CHECK_NAME_DEBOUCE_DURATION_IN_MILLISECONDS = 500;

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
	}

	static defaultProps = {
		isNameValid: false,
	}

	formatMessage = (messageDescriptor, values) => {
		return this.props.intl.formatMessage(messageDescriptor, values);
	}

	/**
	 * Component state
	 *
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
	state = {
		name: "",
		playerLimit: "" + Config.game.players.min,
		width: "" + Config.game.board.width.min,
		height: "" + Config.game.board.height.min,
		nameError: "",
		widthError: "",
		heightError: "",
		playerLimitError: ""
	}

	/**
	 * Sets the component state from the location's query string, if it is not empty.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	setStateFromQuery = (props = this.props) => {
		if (!props.location.search) {
			return;
		}

		const state = qs.parse(props.location.search.replace(/^\?/, ""));

		// if any are NaN, let it use the defaults
		if (Number.isNaN(Number(state.width))) {
			delete state.width;
		}

		if (Number.isNaN(Number(state.height))) {
			delete state.height;
		}

		if (Number.isNaN(Number(state.playerLimit))) {
			delete state.playerLimit;
		}

		if (state.width) {
			state.widthError = this.validateDimension("width", state.width) || "";
		}

		if (state.height) {
			state.heightError = this.validateDimension("height", state.height) || "";
		}

		if (state.playerLimit) {
			state.playerLimitError = this.validatePlayerLimit(state.playerLimit) || "";
		}

		this.setState(state);
	}

	componentWillMount() {
		this.setStateFromQuery();
	}

	componentWillReceiveProps(nextProps) {
		/* istanbul ignore else */
		if (nextProps.location.search && nextProps.location.search !== this.props.location.search) {
			this.setStateFromQuery(nextProps);
		}
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
	 * Checks whether the current state for the specified board dimension is valid.
	 *
	 * @function
	 *
	 * @param {"width"|"height"} dimension - the dimension to check
	 * @param {string} value - the value for the dimension
	 *
	 * @return {?string} the error message, or undefined if the dimension is valid.
	 */
	validateDimension = (dimension, value) => {
		if (value === "") {
			return this.formatMessage(messages.form.errors.general.isRequired);
		}

		value = Number(value);

		if (Number.isNaN(value)) {
			return this.formatMessage(messages.form.errors.dimensions.invalid, {
				dimension,
				value,
			});
		}

		if (value < Config.game.board[dimension].min) {
			return this.formatMessage(messages.form.errors.dimensions.tooSmall, {
				dimension,
				value,
				min: Config.game.board[dimension].min,
			});
		}
		
		if (value > Config.game.board[dimension].max) {
			return this.formatMessage(messages.form.errors.dimensions.tooLarge, {
				dimension,
				value,
				max: Config.game.board[dimension].max,
			});
		}

		return undefined;
	}

	/**
	 * Checks whether the current state for the player limit is valid.
	 *
	 * @function
	 *
	 * @param {string} playerLimit - the player limit input value
	 *
	 * @return {?string} the error message, or undefined if the player limit is valid.
	 */
	validatePlayerLimit = (playerLimit) => {
		if (playerLimit === "") {
			return this.formatMessage(messages.form.errors.general.isRequired);
		}

		const playerLimitAsNumber = Number(playerLimit);

		let error;

		if (Number.isNaN(playerLimitAsNumber)) {
			error = this.formatMessage(messages.form.errors.playerLimit.invalid, {
				value: playerLimit,
			});
		}
		else {
			if (playerLimitAsNumber < Config.game.players.min) {
				error = this.formatMessage(messages.form.errors.playerLimit.tooSmall, {
					value: playerLimit,
					min: Config.game.players.min,
				});
			}
			else if (playerLimitAsNumber > Config.game.players.max) {
				error = this.formatMessage(messages.form.errors.playerLimit.tooLarge, {
					value: playerLimit,
					max: Config.game.players.max,
				});
			}
		}

		return error;
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
		const error = this.validateDimension(dimension, value);

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
		const error = this.validatePlayerLimit(playerLimit);

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
			<div
				{...classes()}
			>
				<FormattedMessage
					tagName="h1"
					{...messages.header}
				/>
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
						<FormattedMessage
							tagName="legend"
							{...messages.form.dimensions.label}
						/>
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
								...classes({
									element: "width-label",
								}),
							}}
							name="width"
							value={this.state.width}
							onChange={this.handleWidthChange}
						/>
						
						<span
							{...classes({
								element: "dimension-separator",
							})}
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
								...classes({
									element: "height-label",
								}),
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
								...classes({
									element: "player-limit-label",
								}),
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

export default injectIntl(CreateGame);
