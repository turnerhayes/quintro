import debounce           from "lodash/debounce";
import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import {
	injectIntl,
	intlShape,
}                         from "react-intl";
import TextField          from "material-ui/TextField";
import Button             from "material-ui/Button";
import Typography         from "material-ui/Typography";
import Card, {
	CardHeader,
	CardContent
}                         from "material-ui/Card";
import { withStyles }     from "material-ui/styles";
import LoadingSpinner     from "@app/components/LoadingSpinner";
import Config             from "@app/config";
import messages           from "./messages";


export const SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS = 10000;

const styles = {
	playerLimitLabel: {
		position: "static",
	},
};

/**
 * Component representing a form for searching for open games to join.
 *
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
class FindGame extends React.PureComponent {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {function} onFindOpenGames - function to trigger searching for open games
	 * @prop {function} onJoinGame - function to call when trying to join a game
	 * @prop {object} [findGameError] - error resulting from the game search, if there was one
	 * @prop {external:Immutable.List} [results] - the results of the search
	 */
	static propTypes = {
		onFindOpenGames: PropTypes.func.isRequired,
		onJoinGame: PropTypes.func.isRequired,
		findGameError: PropTypes.object,
		results: ImmutablePropTypes.list,
		intl: intlShape.isRequired,
		classes: PropTypes.object.isRequired,
	}

	/**
	 * Component state
	 *
	 * @type object
	 *
	 * @prop {string} numberOfPlayers - the player limit that the found games should have (if empty,
	 *	there will be no restriction on the player limit)
	 * @prop {boolean} isSearching=false - true if the component is currently in the middle of a search
	 */
	state = {
		numberOfPlayers: "",
		isSearching: false
	}

	formatMessage = (...args) => {
		return this.props.intl.formatMessage(...args);
	}

	componentDidUpdate() {
		if (this.state.isSearching) {
			if (this.props.findGameError) {
				// TODO: display error notification
				this.setState({ isSearching: false });
			}
			else if (this.props.results) {
				this.handleGamesFound();
			}
		}
	}

	/**
	 * Joins the first game in the results.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	joinGame = () => {
		const gameName = this.props.results.getIn([ 0, "name" ]);

		this.props.onJoinGame({ gameName });
	}

	/**
	 * Executes the search.
	 *
	 * This function is debounced.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	runSearch = debounce(
		() => {
			this.props.onFindOpenGames({
				numberOfPlayers: Number(this.state.numberOfPlayers) || null,
			});

			this.setState({ isSearching: true }); 
		},
		SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS,
		{
			leading: true
		}
	)

	/**
	 * Handles the case when the component has been updated with search results.
	 *
	 * @function
	 * @async
	 *
	 * @return {void}
	 */
	handleGamesFound = () => {
		if (this.props.results.isEmpty()) {
			// Found nothing; try until we do
			this.runSearch();
		} else {
			this.joinGame(0);
		}
	}

	/**
	 * Handles the search form being submitted.
	 *
	 * @function
	 *
	 * @param {event} event - the submit event
	 *
	 * @return {void}
	 */
	handleSearchFormSubmit = (event) => {
		event.preventDefault();

		this.runSearch();
	}

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		return (
			<Card>
				<CardHeader
					title={this.formatMessage(messages.header)}
				/>
				<CardContent>
					{
						this.state.isSearching ?
							this.renderSearching() :
							this.renderForm()
					}
				</CardContent>
			</Card>
		);
	}

	/**
	 * Renders the searching UI.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	renderSearching() {
		return (
			<h3>
				<LoadingSpinner /> Searching for open games, please wait
			</h3>
		);
	}

	handleNumberOfPlayersChanged = (event) => {
		this.setState({ numberOfPlayers: event.target.value });
	}

	/**
	 * Renders the search form.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	renderForm() {
		return (
			<form
				onSubmit={this.handleSearchFormSubmit}
			>
				<div>
					<TextField
						type="number"
						name="playerLimit"
						label={this.formatMessage(messages.form.playerLimit.label)}
						inputProps={{
							min: Config.game.players.min,
							max: Config.game.players.max,
						}}
						InputLabelProps={{
							className: this.props.classes.playerLimitLabel,
						}}
						onChange={this.handleNumberOfPlayersChanged}
						value={this.state.numberOfPlayers}
					/>
					<Typography
						type="caption"
					>
						{this.formatMessage(messages.form.playerLimit.details)}
					</Typography>
				</div>

				<div>
					<Button
						type="submit"
						color="primary"
						disabled={!!this.state.numberOfPlayers && Number.isNaN(Number(this.state.numberOfPlayers))}
					>
						{this.formatMessage(messages.form.submitButton.label)}
					</Button>
				</div>
			</form>
		);
	}
}

export { FindGame as Unwrapped };

export default withStyles(styles)(injectIntl(FindGame));
