import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import Immutable          from "immutable";
import { Link }           from "react-router-dom";
import Button             from "material-ui/Button";
import Tabs, { Tab }      from "material-ui/Tabs";
import List, {
	ListItem,
	ListItemText
}                         from "material-ui/List";
import Badge              from "material-ui/Badge";
import Icon               from "material-ui/Icon";
import createHelper       from "@app/components/class-helper";
import                         "./UserGamesList.less";

const classes = createHelper("user-games-list");


/**
 * Component representing a list of games that the user is a player in.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class UserGamesList extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {function} onGetUserGames - function to be called when user games need to be retrieved
	 * @prop {external:Immutable.List<client.records.GameRecord>} [userGames] - the games
	 *	that the user is a player in
	 * @prop {external:Immutable.Map<string, external:Immutable.List<client.records.PlayerRecord>>} [playersByGame] - a
	 *	mapping of game players indexed by game name
	 */
	static propTypes = {
		onGetUserGames: PropTypes.func.isRequired,
		userGames: ImmutablePropTypes.listOf(
			ImmutablePropTypes.map
		),
		playersByGame: ImmutablePropTypes.mapOf(
			ImmutablePropTypes.listOf(
				ImmutablePropTypes.map
			),
			PropTypes.string
		)
	}

	/// DEBUG
	static defaultProps = {
		onGetUserGames: () => {
			console.log("onGetUserGames");
		},

		userGames: Immutable.List(),
	}
	/// END DEBUG

	state = {
		selectedTabIndex: 0,
	}

	componentWillMount() {
		this.props.onGetUserGames();
	}

	/**
	 * Renders the lists of ended games and in progress games.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	renderGameLists = () => {
		const {
			selectedTabIndex,
		} = this.state;

		const games = this.props.userGames.reduce(
			(games, game) => {
				if (game.get("winner")) {
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

		return [
			(
			<Tabs
				key="tabs"
				value={selectedTabIndex}
				fullWidth
				onChange={(event, selectedTabIndex) => this.setState({ selectedTabIndex })}
			>
				{
					hasGamesInProgress && (
						<Tab
							label="In Progress"
						/>
					)
				}
				{
					hasFinishedGames && (
						<Tab
							label="Finished Games"
						/>
					)
				}
			</Tabs>
			),
			(selectedTabIndex === 0 || !hasFinishedGames) && (
				<List
					key="In Progress List"
					{...classes({
						element: "games-list",
					})}
				>
				{
					games && games.inProgress.sort((a, b) => (b.get("isStarted") - a.get("isStarted"))).map(
						(game) => {
							const players = this.props.playersByGame &&
								this.props.playersByGame.get(game.get("name"));

							const isWaitingForYou = game.get("isStarted") &&
								players && players.find(
									(p) => p.user.isMe
								).color === game.get("currentPlayerColor");

							return (
								<ListItem
									key={`user-game-${game.get("name")}`}
								>
									<Button
										fullWidth
										component={Link}
										to={`/play/${game.get("name")}`}
										{...classes({
											element: "games-list-item",
											extra: [
												game.get("isStarted") && "is-started",
												!game.get("isStarted") && "not-started",
											],
										})}
									>
										<Badge
											badgeContent={game.get("players").size}
											color="primary"
											title={`Game has ${game.get("players").size} player${game.get("players").size === 1 ? "" : "s"}`}
										>
											<Icon
												className="fa fa-2x fa-user-circle"
											/>
										</Badge>
										<ListItemText
											primary={game.get("name")}
										/>

										{
											!game.get("isStarted") &&
												(
													<Icon
														title="Game has not started yet"
														className="fa fa-stop"
													/>
												)
										}
										{
											isWaitingForYou &&
												(
													<Icon
														title="It's your turn!"
														className="fa fa-exclamation"
													/>
												)
										}
									</Button>
								</ListItem>
							);
						}
					)
				}
				</List>
			),
			selectedTabIndex === 1 || !hasGamesInProgress && (
				<List
					key="Finished Games List"
					{...classes({
						element: "games-list",
					})}
				>
				{
					games.over.map(
						(game) => {
							return (
								<ListItem
									key={`user-game-${game.get("name")}`}
								>
									<Button
										fullWidth
										component={Link}
										to={`/play/${game.get("name")}`}
										className="is-over"
									>
										<Badge
											badgeContent={game.get("players").size}
											color="primary"
											title={`Game has ${game.get("players").size} player${game.get("players").size === 1 ? "" : "s"}`}
										>
											<Icon
												className="fa fa-2x fa-user-circle"
											/>
										</Badge>
										<ListItemText primary={game.get("name")} />
									</Button>
								</ListItem>
							);
						}
					)
				}
				</List>
			),
		];
	}

	/**
	 * Renders a message for when the user is not in any games.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	renderEmptyGames = () => {
		return (
			<p>
			You are not a part of any games. <Link to="/game/find">Find one to join</Link> or <Link to="/game/create">start your own!</Link>
			</p>
		);
	}

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		if (this.props.userGames === null) {
			return null;
		}

		return (
			<div
				{...classes()}
			>
				<header>
					<h3>My Games</h3>
				</header>

				{
					this.props.userGames.isEmpty() ?
						this.renderEmptyGames() :
						this.renderGameLists()
				}
			</div>
		);
	}
}

export default UserGamesList;
