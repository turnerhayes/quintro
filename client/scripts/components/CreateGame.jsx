import {
	debounce,
	isNaN
}                     from "lodash";
import Promise        from "bluebird";
import React          from "react";
import PropTypes      from "prop-types";
import { withRouter } from "react-router";
import { connect }    from "react-redux";
import qs             from "qs";
import GameUtils      from "project/scripts/utils/game";
import {
	createGame
}                     from "project/scripts/redux/actions";
import Config         from "project/shared-lib/config";

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

class CreateGame extends React.Component {
	static propTypes = {
		location: PropTypes.object,
		dispatch: PropTypes.func.isRequired
	}

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

	handleNameInputChange = (event) => {
		this.setState({
			name: event.target.value,
			nameError: ""
		});

		this.debouncedCheckName();
	}

	validateDimension = (dimension) => {
		const value = this.state[dimension];
		let error;

		if (isNaN(value)) {
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

	handleDimensionInputChange = (dimension, value) => {
		this.setState({
			[dimension]: value,
			[`${dimension}Error`]: ""
		});
	}

	handleDimensionInputBlur = (dimension) => {
		this.setState({
			[`${dimension}Error`]: this.validateDimension(dimension) || ""
		});
	}

	handlePlayerLimitBlur = () => {
		this.setState({
			playerLimitError: this.validatePlayerLimit() || ""
		});
	}

	checkName = () => {
		if (!this.state.name) {
			return Promise.resolve(undefined);
		}

		return GameUtils.checkIfGameExists({ gameName: this.state.name }).then(
			(exists) => {
				this.setState({ nameError: exists ? NAME_IN_USE_ERROR_MESSAGE : "" });

				return exists;
			}
		);
	}

	debouncedCheckName = debounce(this.checkName, CHECK_NAME_DEBOUCE_DURATION_IN_MILLISECONDS)

	createGame = (event) => {
		event.preventDefault();

		// Don't bother calling any debounced checkNames, since we're manually calling it again
		this.debouncedCheckName.cancel();

		if (!this.state.name) {
			this.setState({ nameError: "You must provide a game name" });
			return;
		}

		this.checkName().then(
			(exists) => {
				if (exists === undefined) {
					// Name is empty (or otherwise invalid--don't process it)
					this.setState({ nameError: "" });
					return;
				}

				if (!exists) {
					// Name is free--take it!
					this.props.dispatch(createGame(this.state));
				}
			}
		);
	}

	renderErrorMessage = (errorMessage) => {
		return (
			errorMessage ?
			(
				<div
					className="text-danger form-control-feedback"
				>
					{errorMessage}
				</div>
			) :
			null
		);
	}

	render() {
		return (
			<div className="create-game-form-container">
				<form
					className="create-game-form"
					encType="application/www-form-urlencoded"
					method="post"
					action="/game/create"
					onSubmit={this.createGame}
				>
					<div
						className={`form-row form-group ${this.state.nameError ? "has-danger" : ""}`}
					>
						<label>
							Name:
							<input
								required
								type="text"
								className={`form-control ${this.state.nameError ? "form-control-danger" : ""}`}
								name="name"
								value={this.state.name}
								onChange={this.handleNameInputChange}
							/>
						</label>
						{ this.renderErrorMessage(this.state.nameError) }
					</div>
					<div className="form-row form-group">
						<span>Dimensions:</span>
						<label
							className={this.state.widthError ? "has-danger" : ""}
						>
							Width:
							<input
								type="number"
								className="form-control"
								min={Config.game.board.width.min}
								max={Config.game.board.width.max}
								name="width"
								value={this.state.width}
								onChange={(event) => this.handleDimensionInputChange("width", event.target.valueAsNumber)}
								onBlur={(event) => this.handleDimensionInputBlur("width", event.target.valueAsNumber)}
							/>
						</label>
						<label
							className={this.state.heightError ? "has-danger" : ""}
						>
							Height:
							<input
								type="number"
								className="form-control"
								min={Config.game.board.height.min}
								max={Config.game.board.height.max}
								name="height"
								value={this.state.height}
								onChange={(event) => this.handleDimensionInputChange("height", event.target.valueAsNumber)}
								onBlur={(event) => this.handleDimensionInputBlur("height", event.target.valueAsNumber)}
							/>
						</label>
						{ this.renderErrorMessage(this.state.widthError) }
						{ this.renderErrorMessage(this.state.heightError) }
					</div>
					<div className="form-row form-group">
						<label>
							Number of players:
							<input
								type="number"
								className="form-control"
								min={Config.game.players.min}
								max={Config.game.players.max}
								name="playerLimit"
								value={this.state.playerLimit}
								onChange={(event) => this.setState({ playerLimit: event.target.valueAsNumber })}
								onBlur={this.handlePlayerLimitBlur}
							/>
						</label>
						{ this.renderErrorMessage(this.state.playerLimitError) }
					</div>
					<div className="form-row form-group">
						<button className="btn btn-primary" type="submit">Create</button>
					</div>
				</form>
			</div>

		);
	}
}

export default withRouter(
	connect(
	)(CreateGame)
);
