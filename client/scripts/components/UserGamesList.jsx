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
import { Map }            from "immutable";
import GameRecord         from "project/scripts/records/game";
import PlayerRecord       from "project/scripts/records/player";
import {
	getUserGames
}                         from "project/scripts/redux/actions";
import {
	playerSelector
}                         from "project/scripts/redux/selectors";
import                         "react-tabs/style/react-tabs.less";
import                         "project/styles/user-games-list";

class UserGamesList extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		userGames: ImmutablePropTypes.listOf(
			PropTypes.instanceOf(GameRecord)
		),
		playersByGame: ImmutablePropTypes.mapOf(
			ImmutablePropTypes.listOf(
				PropTypes.instanceOf(PlayerRecord)
			),
			PropTypes.string
		)
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
										const players = this.props.playersByGame &&
											this.props.playersByGame.get(game.name);
										const classes = [
											"list-group-item",
											"list-group-item-action",
											"justify-content-between",
											"c_user-games-list--games-list--item"
										];

										if (game.isStarted) {
											classes.push("is-started");
										}
										else {
											classes.push("not-started");
										}

										const isWaitingForYou = game.isStarted &&
											players && players.find(
												(p) => p.user.isMe
											).color === game.currentPlayerColor;

										return (
											<Link
												to={`/play/${game.name}`}
												key={`user-game-${game.name}`}
												className={classes.join(" ")}
											>
												{game.name}
												<span
													className="c_user-games-list--games-list--item--badges"
												>
													<span
														className="badge badge-default badge-pill fa fa-user-circle"
														title={`Game has ${game.players.size} players`}
													> {game.players.size}</span>
													{
														game.isStarted ?
															undefined :
															(
																<span
																	className="badge badge-default badge-pill fa fa-stop"
																	title="Game has not started yet"
																>&#8203;</span>
															)
													}
													{
														isWaitingForYou ?
															(
																<span
																	className="badge badge-danger badge-pill fa fa-exclamation"
																	title="It's your turn!"
																>&#8203;</span>
															) :
															undefined
													}
												</span>
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

		return {
			userGames,
			playersByGame: userGames && Map(
				userGames.reduce(
					(gamesToPlayers, game) => {
						let players = playerSelector(state, { players: game.players });

						if (players) {
							gamesToPlayers[game.name] = players;
						}

						return gamesToPlayers;
					},
					{}
				)
			)
		};
	}
)(UserGamesList);
