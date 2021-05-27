import { Map }            from "immutable";
import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { Link }           from "react-router-dom";
import { withStyles }     from "@material-ui/core/styles";
import Button             from "@material-ui/core/Button";
import Tabs               from "@material-ui/core/Tabs";
import Tab                from "@material-ui/core/Tab";
import ListComponent      from "@material-ui/core/List";
import ListItem           from "@material-ui/core/ListItem";
import ListItemText       from "@material-ui/core/ListItemText";
import Badge              from "@material-ui/core/Badge";
import StopIcon           from "@material-ui/icons/Stop";
import WarningIcon        from "@material-ui/icons/Warning";
import AccountCircleIcon  from "@material-ui/icons/AccountCircle";
import {
	FormattedMessage,
	injectIntl,
	intlShape
}                         from "react-intl";

import gameSelectors      from "@app/selectors/games/game";

import messages           from "./messages";


const styles = {
	root: {
		height: "100%",
		display: "flex",
		flexDirection: "column",
	},

	gamesList: {
		flex: 1,
		overflowY: "auto",
	},
};


/**
 * Component representing a list of games that the user is a player in.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class UserGamesList extends React.PureComponent {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {function} onGetUserGames - function to be called when user games need to be retrieved
	 * @prop {external:Immutable.List<external:Immutable.Map>} [userGames] - the games
	 *	that the user is a player in
	 */
	static propTypes = {
		onGetUserGames: PropTypes.func.isRequired,
		userGames: PropTypes.oneOfType([
			ImmutablePropTypes.listOf(
				ImmutablePropTypes.map
			).isRequired,
			PropTypes.oneOf([ null ]),
		]),
		users: ImmutablePropTypes.mapOf(
			ImmutablePropTypes.map,
			PropTypes.string
		).isRequired,
		classes: PropTypes.object.isRequired,
		intl: intlShape.isRequired,
	}

	state = {
		selectedTabIndex: 0,
	}

	componentDidMount() {
		this.props.onGetUserGames();
	}

	handleTabChange = (event, selectedTabIndex) => {
		this.setState({ selectedTabIndex });
	}

	formatMessage = (messageDescriptor, values) => {
		return this.props.intl.formatMessage(messageDescriptor, values);
	}

	getGameBadgeTooltip = (game) => {
		return this.formatMessage(messages.badgeTooltip, {
			playerCount: game.get("players").size,
		});
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
				if (gameSelectors.isOver(game)) {
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
					// fullWidth
					onChange={this.handleTabChange}
				>
					{
						hasGamesInProgress && (
							<Tab
								key="in-progress-tab"
								label={this.formatMessage(messages.inProgressTab)}
							/>
						)
					}
					{
						hasFinishedGames && (
							<Tab
								key="finished-tab"
								label={this.formatMessage(messages.finishedTab)}
							/>
						)
					}
				</Tabs>
			),
			(selectedTabIndex === 0 || !hasFinishedGames) && (
				<ListComponent
					key="In Progress List"
					className={this.props.classes.gamesList}
				>
					{
						games && games.inProgress.sort((a, b) => (b.get("isStarted") - a.get("isStarted"))).map(
							(game) => {
								const players = game.get("players");

								const isWaitingForYou = game.get("isStarted") &&
									players &&
									players.find(
										(player) => this.props.users.get(player.get("userID"), Map()).get("isMe")
									).get("color") === gameSelectors.getCurrentPlayerColor(game);

								return (
									<ListItem
										key={game.get("name")}
									>
										<Button
											fullWidth
											component={Link}
											to={`/play/${game.get("name")}`}
										>
											<Badge
												badgeContent={game.get("players").size}
												color="primary"
												title={this.getGameBadgeTooltip(game)}
											>
												<AccountCircleIcon
												/>
											</Badge>
											<ListItemText
												primary={game.get("name")}
											/>

											{
												!game.get("isStarted") &&
												(
													<div
														title={this.formatMessage(messages.notStartedListItem)}
													>
														<StopIcon />
													</div>
												)
											}
											{
												isWaitingForYou &&
												(
													<div
														title={this.formatMessage(messages.waitingForYouListItem)}
													>
														<WarningIcon />
													</div>
												)
											}
										</Button>
									</ListItem>
								);
							}
						)
					}
				</ListComponent>
			),
			(selectedTabIndex === 1 || !hasGamesInProgress) && (
				<ListComponent
					key="Finished Games List"
					className={this.props.classes.gamesList}
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
												title={this.getGameBadgeTooltip(game)}
											>
												<AccountCircleIcon
												/>
											</Badge>
											<ListItemText primary={game.get("name")} />
										</Button>
									</ListItem>
								);
							}
						)
					}
				</ListComponent>
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
				<FormattedMessage
					{...messages.noGamesActionsMessage}
					values={{
						findGameLink: (
							<Link to="/game/find">
								<FormattedMessage
									{...messages.noGamesActionsFindGameLinkText}
								/>
							</Link>
						),

						createGameLink: (
							<Link to="/game/create">
								<FormattedMessage
									{...messages.noGamesActionsCreateGameLinkText}
								/>
							</Link>
						),
					}}
				/>
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
				className={this.props.classes.root}
			>
				<header>
					<h3>
						<FormattedMessage
							{...messages.title}
						/>
					</h3>
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

export { UserGamesList as Unwrapped };

export default injectIntl(withStyles(styles)(UserGamesList));
