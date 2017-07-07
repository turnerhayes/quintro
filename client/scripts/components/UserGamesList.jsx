import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { connect }        from "react-redux";
import { Link }           from "react-router-dom";
import {
	Tab,
	Tabs,
	TabList,
	TabPanel
}                         from "react-tabs";
import UserRecord         from "project/scripts/records/user";
import GameRecord         from "project/scripts/records/game";
import {
	getUserGames
}                         from "project/scripts/redux/actions";
import                         "react-tabs/style/react-tabs.less";
import                         "project/styles/user-games-list";

class UserGamesList extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		user: PropTypes.instanceOf(UserRecord).isRequired,
		userGames: ImmutablePropTypes.listOf(
			PropTypes.instanceOf(GameRecord)
		),
	}

	componentWillMount() {
		this.props.dispatch(
			getUserGames()
		);
	}

	renderGameLists = () => {
		const games = this.props.userGames.reduce(
			(games, game) => {
				if (game.winner) {
					games.over.push(game);
				}
				else {
					games.inProgress.push(game);
				}

				return games;
			},
			{
				inProgress: [],
				over: []
			}
		);

		const hasGamesInProgress = games && games.inProgress.length > 0;
		const hasFinishedGames = games && games.over.length > 0;

		return (
			<Tabs
			>
				<TabList>
					{
						hasGamesInProgress && (
							<Tab
							>In Progress</Tab>
						)
					}
					{
						hasFinishedGames && (
							<Tab
							>Finished Games</Tab>
						)
					}
				</TabList>

				{
					hasGamesInProgress && (
						<TabPanel>	
							<div
								className="c_user-games-list--games-list list-group"
							>
							{
								games && games.inProgress.sort((a, b) => (b.isStarted - a.isStarted)).map(
									(game) => {
										const classes = ["list-group-item"];

										if (game.isStarted) {
											classes.push("is-started");
										}
										else {
											classes.push("not-started");
										}

										const isWaitingForYou = game.isStarted && game.players.find((p) => p.isMe).color === game.currentPlayerColor;

										return (
											<Link
												to={`/play/${game.name}`}
												key={`user-game-${game.name}`}
												className={classes.join(" ")}
											>
												{game.name}
												<span
													className="badge fa fa-user-circle"
													title={`Game has ${game.players.size} players`}
												> {game.players.size}</span>
												{
													game.isStarted ?
														undefined :
														(
															<span
																className="badge fa fa-stop"
																title="Game has not started yet"
															>&#8203;</span>
														)
												}
												{
													isWaitingForYou ?
														(
															<span
																className="badge fa fa-exclamation"
																title="It's your turn!"
															>&#8203;</span>
														) :
														undefined
												}
											</Link>
										);
									}
								)
							}
							</div>
						</TabPanel>
					)
				}

				{
					hasFinishedGames && (
						<TabPanel>
							<ul
								className="c_user-games-list--games-list list-group"
							>
							{
								games.over.map(
									(game) => {
										return (
											<Link
												to={`/play/${game.name}`}
												key={`user-game-${game.name}`}
												className="is-over list-group-item"
											>
												{game.name}
											</Link>
										);
									}
								)
							}
							</ul>
						</TabPanel>
					)
				}
			</Tabs>
		);
	}

	renderEmptyGames = () => {
		return (
			<p>
			You are not a part of any games. <Link to="/game/find">Find one to join</Link> or <Link to="/game/create">start your own!</Link>
			</p>
		);
	}

	render() {
		if (this.props.userGames === null) {
			return null;
		}

		return (
			<div
				className="c_user-games-list"
			>
				<header>
					<h3>My Games</h3>
				</header>

				{
					this.props.userGames.size > 0 ?
						this.renderGameLists() :
						this.renderEmptyGames()
				}
			</div>
		);
	}
}

export default connect(
	function mapStateToProps(state) {
		const games = state.get("games");
		const userGames = games && games.userGames;
		const users = state.get("users");
		const user = users.currentUser;

		return {
			user,
			userGames
		};
	}
)(UserGamesList);
