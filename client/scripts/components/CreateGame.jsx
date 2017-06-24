import React          from "react";
import PropTypes      from "prop-types";
import { withRouter } from "react-router";
import { connect }    from "react-redux";
import qs             from "qs";
import {
	createGame
}                     from "project/scripts/redux/actions";

class CreateGame extends React.Component {
	static propTypes = {
		match: PropTypes.object,
		location: PropTypes.object,
		dispatch: PropTypes.func.isRequired
	}

	setStateFromQuery = () => {
		if (!this.props.location.search) {
			return;
		}

		const query = qs.parse(this.props.location.search.replace(/^\?/, ""));

		if (query.width) {
			query.width = Number(query.width);
		}

		if (query.height) {
			query.height = Number(query.height);
		}

		if (query.playerLimit) {
			query.playerLimit = Number(query.playerLimit);
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

	createGame = (event) => {
		event.preventDefault();

		this.props.dispatch(createGame(this.state));
	}

	state = {
		name: "",
		playerLimit: 3,
		width: 20,
		height: 20
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
					<div className="form-row form-group">
						<label>
							Name:
							<input
								required
								type="text"
								className="form-control"
								name="name"
								value={this.state.name}
								onChange={event => this.setState({ name: event.target.value })}
							/>
						</label>
					</div>
					<div className="form-row form-group">
						<span>Dimensions:</span>
						<label>
							Width:
							<input
								type="number"
								className="form-control"
								min="15"
								max="25"
								name="width"
								value={this.state.width}
								onChange={event => this.setState({ width: event.target.valueAsNumber })}
							/>
						</label>
						<label>
							Height:
							<input
								type="number"
								className="form-control"
								min="15"
								max="25"
								name="height"
								value={this.state.height}
								onChange={event => this.setState({ height: event.target.valueAsNumber })}
							/>
						</label>
					</div>
					<div className="form-row form-group">
						<label>
							Number of players:
							<input
								type="number"
								className="form-control"
								min="3"
								max="6"
								name="playerLimit"
								value={this.state.playerLimit}
								onChange={event => this.setState({ playerLimit: event.target.value })}
							/>
						</label>
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
