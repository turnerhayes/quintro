import debounce           from "lodash/debounce";
import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import {
	injectIntl,
	intlShape,
	FormattedMessage,
}                         from "react-intl";
import TextField          from "@material-ui/core/TextField";
import Button             from "@material-ui/core/Button";
import Typography         from "@material-ui/core/Typography";
import Card               from "@material-ui/core/Card";
import CardHeader         from "@material-ui/core/CardHeader";
import CardContent        from "@material-ui/core/CardContent";
import { withStyles }     from "@material-ui/core/styles";
import LoadingSpinner     from "@app/components/LoadingSpinner";
import Config             from "@app/config";
import messages           from "./messages";


export const SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS = 10000;

const styles = {
	playerLimitLabel: {
		position: "static",
	},

	// This is here simply to give a class to the Cancel button so that
	// it can be grabbed by tests
	cancelButton: {},
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
	 * @prop {function} onJoinGame - function to call when cancelling a search
	 * @prop {object} [findGameError] - error resulting from the game search, if there was one
	 * @prop {external:Immutable.List} [results] - the results of the search
	 */
	static propTypes = {
		onFindOpenGames: PropTypes.func.isRequired,
		onJoinGame: PropTypes.func.isRequired,
		onCancelFind: PropTypes.func.isRequired,
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
		// istanbul ignore else
		if (this.state.isSearching) {
			if (this.props.findGameError) {
				// TODO: display error notification
				this.setState({ isSearching: false });
			}
			else {
				// istanbul ignore else
				if (this.props.results) {
					this.handleGamesFound();
				}
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

	cancelSearch = () => {
		this.runSearch.cancel();
		this.setState({ isSearching: false });
		this.props.onCancelFind();
	}

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
			<React.Fragment>
				<h3>
					<LoadingSpinner /> <FormattedMessage {...messages.searchingText} />
				</h3>
				<Button
					onClick={this.cancelSearch}
					className={this.props.classes.cancelButton}
				>
					{this.formatMessage(messages.cancelSearchLabel)}
				</Button>
			</React.Fragment>
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
