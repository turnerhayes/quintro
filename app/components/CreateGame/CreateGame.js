import debounce          from "lodash/debounce";
// import Promise           from "bluebird";
import React             from "react";
import PropTypes         from "prop-types";
import TextField         from "material-ui/TextField";
import Button            from "material-ui/Button";
import qs                from "qs";
// import GameUtils         from "@app/utils/game";
import Config            from "@app/config";
import createClassHelper from "@app/components/class-helper";
import                        "./CreateGame.less";

const classes = createClassHelper("create-game");

const NAME_IN_USE_ERROR_MESSAGE = "That name is already in use. Please use another name.";
const INVALID_DIMENSION_ERROR_MESSAGE = (dimension, value) => (
	`${value} is not a valid value for the ${dimension}`
);
const DIMENSION_TOO_SMALL_ERROR_MESSAGE = (dimension, value) => (
	`${value} is less than the minimum ${dimension} of ${Config.game.board[dimension].min}`
);
const DIMENSION_TOO_LARGE_ERROR_MESSAGE = (dimension, value) => (
	`${value} is greater than the maximum ${dimension} of ${Config.game.board[dimension].max}`
);
const INVALID_PLAYER_LIMIT_ERROR_MESSAGE = (playerLimit) => (
	`${playerLimit} is not a valid value for the player limit`
);
const TOO_FEW_PLAYERS_ERROR_MESSAGE = (playerLimit) => (
	`${playerLimit} is less than the minimum number of players (${Config.game.players.min})`
);
const TOO_MANY_PLAYERS_ERROR_MESSAGE = (playerLimit) => (
	`${playerLimit} is greater than the maximum number of players (${Config.game.players.max})`
);
const CHECK_NAME_DEBOUCE_DURATION_IN_MILLISECONDS = 500;

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
	}

	static defaultProps = {
		isNameValid: false,
	}

	/**
	 * Component state
	 *
	 * @type object
	 *
	 * @prop {string} name="" - the name to give the game
	 * @prop {number} playerLimit=3 - the maximum number of players that will be able to play the
	 *	game
	 * @prop {number} width=minimum - the width of the game board. Defaults to the app-wide configured minimum.
	 * @prop {number} height=minimum - the height of the game board. Defaults to the app-wide configured minimum.
	 * @prop {string} nameError="" - the error message to show for the entered name (if applicable)
	 * @prop {string} widthError="" - the error message to show for the entered width (if applicable)
	 * @prop {string} heightError="" - the error message to show for the entered height (if applicable)
	 * @prop {string} playerLimitError="" - the error message to show for the entered player limit (if applicable)
	 */
	state = {
		name: "",
		playerLimit: 3,
		width: Config.game.board.width.min,
		height: Config.game.board.height.min,
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
	setStateFromQuery = () => {
		if (!this.props.location.search) {
			return;
		}

		const query = qs.parse(this.props.location.search.replace(/^\?/, ""));

		// if any are NaN, let it use the defaults
		if (query.width) {
			query.width = Number(query.width) || undefined;
		}

		if (query.height) {
			query.height = Number(query.height) || undefined;
		}

		if (query.playerLimit) {
			query.playerLimit = Number(query.playerLimit) || undefined;
		}
		
		this.setState(Object.assign({}, this.state, query));
	}

	componentWillMount() {
		this.setStateFromQuery();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.location.search && nextProps.location.search !== this.props.location.search) {
			this.setStateFromQuery();
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
	 *
	 * @return {?string} the error message, or undefined if the dimension is valid.
	 */
	validateDimension = (dimension) => {
		const value = this.state[dimension];
		let error;

		// Is NaN?
		if (value !== value) {
			error = INVALID_DIMENSION_ERROR_MESSAGE(dimension, value);
		}
		else {
			if (value < Config.game.board[dimension].min) {
				error = DIMENSION_TOO_SMALL_ERROR_MESSAGE(dimension, value);
			}
			else if (value > Config.game.board[dimension].max) {
				error = DIMENSION_TOO_LARGE_ERROR_MESSAGE(dimension, value);
			}
		}

		return error;
	}

	/**
	 * Checks whether the current state for the player limit is valid.
	 *
	 * @function
	 *
	 * @return {?string} the error message, or undefined if the player limit is valid.
	 */
	validatePlayerLimit = () => {
		const { playerLimit } = this.state;
		let error;

		if (isNaN(playerLimit)) {
			error = INVALID_PLAYER_LIMIT_ERROR_MESSAGE(playerLimit);
		}
		else {
			if (playerLimit < Config.game.players.min) {
				error = TOO_FEW_PLAYERS_ERROR_MESSAGE(playerLimit);
			}
			else if (playerLimit > Config.game.players.max) {
				error = TOO_MANY_PLAYERS_ERROR_MESSAGE(playerLimit);
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
	 * @param {number|NaN} value - the value to change the dimension to
	 *
	 * @return {void}
	 */
	handleDimensionInputChange = (dimension, value) => {
		this.setState({
			[dimension]: value,
			[`${dimension}Error`]: ""
		});
	}

	/**
	 * Handles a blur of a board dimension input.
	 *
	 * @function
	 *
	 * @param {"width"|"height"} dimension - the name of the dimension whose input is being blurred
	 *
	 * @return {void}
	 */
	handleDimensionInputBlur = (dimension) => {
		this.setState({
			[`${dimension}Error`]: this.validateDimension(dimension) || ""
		});
	}

	/**
	 * Handles a blur of the player limit input.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handlePlayerLimitBlur = () => {
		this.setState({
			playerLimitError: this.validatePlayerLimit() || ""
		});
	}

	/**
	 * Checks to see whether the name value in the current state is already being used.
	 *
	 * @function
	 * @async
	 *
	 * @return {external:Bluebird.Promise} a promise that resolves with a boolean value indicating
	 *	whether the name is currently in use.
	 */
	checkName = () => {
		this.props.onCheckName({ name: this.state.name });
		// return Promise.resolve();
		// if (!this.state.name) {
		// 	return Promise.resolve(undefined);
		// }

		// return GameUtils.checkIfGameExists({ gameName: this.state.name }).then(
		// 	(exists) => {
		// 		this.setState({ nameError: exists ? NAME_IN_USE_ERROR_MESSAGE : "" });

		// 		return exists;
		// 	}
		// );
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
			width: this.state.width,
			height: this.state.height,
			playerLimit: this.state.playerLimit,
		});

		// if (!this.state.name) {
		// 	this.setState({ nameError: "You must provide a game name" });
		// 	return;
		// }

		// this.checkName().then(
		// 	(exists) => {
		// 		if (exists === undefined) {
		// 			// Name is empty (or otherwise invalid--don't process it)
		// 			this.setState({ nameError: "" });
		// 			return;
		// 		}

		// 		if (!exists) {
		// 			// Name is free--take it!
		// 			this.props.onCreateGame(this.state);
		// 		}
		// 	}
		// );
	}

	handleNumberOfPlayersChanged = (event) => {
		this.setState({ playerLimit: event.target.valueAsNumber || null });
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
				<h1>Create A Game</h1>
				<form
					{...classes({
						element: "form",
					})}
					encType="application/www-form-urlencoded"
					method="post"
					action="/game/create"
					onSubmit={this.handleFormSubmit}
				>
					<div
					>
						<TextField
							required
							label="Name"
							error={this.state.name.length > 0 && !this.props.isNameValid}
							helperText={
								this.state.name.length === 0 || this.props.isNameValid ?
									"" :
									NAME_IN_USE_ERROR_MESSAGE
							}
							name="name"
							value={this.state.name}
							onChange={this.handleNameInputChange}
						/>
					</div>
					<fieldset
						{...classes({
							element: "dimensions-container",
						})}
					>
						<legend>Dimensions</legend>
						<TextField
							type="number"
							label="Width"
							error={!!this.state.widthError}
							helperText={this.state.widthError}
							min={Config.game.board.width.min}
							max={Config.game.board.width.max}
							name="width"
							value={this.state.width}
							onChange={(event) => this.handleDimensionInputChange("width", event.target.valueAsNumber)}
							onBlur={(event) => this.handleDimensionInputBlur("width", event.target.valueAsNumber)}
						/>
						<TextField
							type="number"
							label="Height"
							error={!!this.state.heightError}
							helperText={this.state.heightError}
							min={Config.game.board.height.min}
							max={Config.game.board.height.max}
							name="height"
							value={this.state.height}
							onChange={(event) => this.handleDimensionInputChange("height", event.target.valueAsNumber)}
							onBlur={(event) => this.handleDimensionInputBlur("height", event.target.valueAsNumber)}
						/>
					</fieldset>
					<div>
						<TextField
							type="number"
							label="Number of players"
							error={!!this.state.playerLimitError}
							helperText={this.state.playerLimitError}
							min={Config.game.players.min}
							max={Config.game.players.max}
							name="playerLimit"
							value={this.state.playerLimit}
							onChange={this.handleNumberOfPlayersChanged}
							onBlur={this.handlePlayerLimitBlur}
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
						Create
					</Button>
				</form>
			</div>

		);
	}
}

export default CreateGame;
