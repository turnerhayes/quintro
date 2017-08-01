import _                  from "lodash";
import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { connect }        from "react-redux";
import { withRouter }     from "react-router";
import { push }           from "react-router-redux";
import Config             from "project/scripts/config";
import GameClient         from "project/scripts/utils/game-client";
import {
	findOpenGames
}                         from "project/scripts/redux/actions";
import                         "project/styles/find-game.less";

const SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS = 10000;

class FindGame extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			pathname: PropTypes.string,
		}).isRequired,
		dispatch: PropTypes.func.isRequired,
		findGameError: PropTypes.object,
		results: ImmutablePropTypes.list
	}

	state = {
		numberOfPlayers: null,
		isSearching: false
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

	joinGame = (index) => {
		if (!this.props.results.get(index)) {
			// ran out of results; keep trying until we have success
			this.runSearch();
			return;
		}

		const gameName = this.props.results.get(index).name;

		// Join the game first in order to "save" a spot in the game;
		// otherwise, there's the possibility of this user going to the
		// game, but in the time it takes for them to load the game page,
		// another player enters that same game, and then this user is unable to join.
		return GameClient.joinGame({
			gameName
		}).then(
			() => {
				this.props.dispatch(push(`/play/${gameName}`));
			}
		).catch(
			// If we couldn't join a game, try the next one
			() => this.joinGame(index + 1)
		);
	}

	runSearch = _.debounce(
		() => {
			this.props.dispatch(
				findOpenGames({
					numberOfPlayers: this.state.numberOfPlayers
				})
			);

			this.setState({ isSearching: true }); 
		},
		SEARCH_DEBOUNCE_PERIOD_IN_MILLISECONDS,
		{
			leading: true
		}
	)

	handleGamesFound = () => {
		if (this.props.results.isEmpty()) {
			// Found nothing; try until we do
			this.runSearch();
		} else {
			return this.joinGame(0);
		}
	}

	handleSearchFormSubmit = (event) => {
		event.preventDefault();

		this.runSearch();
	}

	render() {
		return (
			<section
				className="c_find-game"
			>
				<header
					className="c_find-game--header"
				>
					<h1>Find a Game</h1>
				</header>
				{
					this.state.isSearching ?
						this.renderSearching() :
						this.renderForm()
				}
			</section>
		);
	}

	renderSearching() {
		return (
			<h3
				className="c_find-game--loading-message"
			>
				<span className="fa fa-spinner fa-spin fa-2x fa-fw" /> Searching for open games, please wait
			</h3>
		);
	}

	renderForm() {
		return (
			<form
				action={this.props.location.pathname}
				method="get"
				encType="application/x-www-form-urlencoded"
				onSubmit={this.handleSearchFormSubmit}
			>
				<div
					className="form-group"
				>
					<label
						htmlFor="c_find-game--find-game-form--num-players"
					>
						Number of players
					</label>
					<input
						type="number"
						className="c_find-game--find-game-form--num-players form-control"
						id="c_find-game--find-game-form--num-players"
						min={Config.game.players.min}
						max={Config.game.players.max}
						onChange={(event) => this.setState({numberOfPlayers: event.target.valueAsNumber || null})}
					/>
					<div
						className="label label-info"
					>
						Leave blank if you don&#39;t care how many players the game has
					</div>
				</div>

				<div
					className="form-group"
				>
					<button
						type="submit"
						className="btn btn-primary"
					>Find</button>
				</div>
			</form>
		);
	}
}

export default connect(
	function mapStateToProps(state) {
		const { findGameError, findResults } = state.get("games") || {};

		return {
			findGameError,
			results: findResults
		};
	}
)(withRouter(FindGame));
