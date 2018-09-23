import React              from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import PropTypes          from "prop-types";
import {
	injectIntl,
	intlShape,
}                         from "react-intl";
import { withStyles }     from "@material-ui/core/styles";
import classnames         from "classnames";

import LoadingSpinner     from "@app/components/LoadingSpinner";
import Marble             from "@app/components/Marble";
import gameSelectors      from "@app/selectors/games/game";

import messages           from "./messages";

const MARBLE_SIZE = {
	absent: "2.4em",
	normal: "3em",
};

const styles = {
	root: {
		marginBottom: "1em",
	},

	list: {
		listStyleType: "none",
		paddingLeft: 0,
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
	},

	item: {
		margin: "0 0.6em",
	},

	currentPlayerItem: {
		fontSize: "1.3em",
	},

	
	activeItem: {
		"&::after": {
			content: "'▲'",
			display: "inline-block",
			width: "100%",
			textAlign: "center",
			fontSize: "1.5em",
		},
	},
};

/**
 * @callback client.react-components.PlayerIndicators~onIndicatorClick
 *
 * @param {object} args - the function arguments
 * @param {external:Immutable.Map} args.selectedPlayer - the player whose indicator was clicked
 *
 * @return {void}
 */

/**
 * Component representing a set of indicators for visualizing the state of the
 * players in the game.
 *
 * @class
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class PlayerIndicators extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {external:Immutable.Map} game - the game the players are in
	 * @prop {boolean} [markActive] - whether or not to distinguish which player is the current player
	 * @prop {client.react-components.PlayerIndicators~onIndicatorClick} [onPlayerIndicatorClicked] - handler
	 *	for when an indicator is clicked
	 */
	static propTypes = {
		game: ImmutablePropTypes.map,

		playerUsers: ImmutablePropTypes.mapOf(
			ImmutablePropTypes.map,
			PropTypes.string
		).isRequired,

		markActive: PropTypes.bool,

		onIndicatorClick: PropTypes.func,

		indicatorProps: PropTypes.oneOfType([
			PropTypes.object,
			PropTypes.func,
		]),

		intl: intlShape.isRequired,

		classes: PropTypes.object,
	}

	formatMessage = (...args) => {
		return this.props.intl.formatMessage(...args);
	}

	/**
	 * Handles a click on a player indicator.
	 *
	 * @function
	 *
	 * @param {client.records.PlayerRecord} selectedPlayer - the player whose indicator was clicked
	 * @param {DOMElement} element - the DOM element corresponding to the indicator selected
	 *
	 * @return {void}
	 */
	handlePlayerIndicatorClick = (selectedPlayer, element) => {
		this.props.onIndicatorClick && this.props.onIndicatorClick({ selectedPlayer, element });
	}

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		const {
			game,
			markActive,
			classes,
		} = this.props;

		if (game.get("players").isEmpty()) {
			return (<LoadingSpinner />);
		}

		return (
			<div
				className={classes.root}
			>
				<ul
					className={classes.list}
				>
					{
						game.get("players").map(
							(player, index) => {
								const playerUser = this.props.playerUsers.get(player.get("userID"));

								const active = player.get("color") === gameSelectors.getCurrentPlayerColor(game);
								const isPresent = !!game.getIn(["playerPresence", player.get("color")]);

								let message;
								const messageArgs = {};

								if (playerUser.get("isMe")) {
									message = messages.indicatorMessages.you;
								}
								else {
									if (playerUser.getIn(["name", "display"])) {
										message = messages.indicatorMessages.namedPlayer;
										messageArgs.playerName = playerUser.getIn(["name", "display"]);
									}
									else {
										message = messages.indicatorMessages.anonymousPlayer;
										messageArgs.playerColor = player.get("color");
									}

									if (isPresent) {
										message = message.present;
									}
									else {
										message = message.absent;
									}
								}

								const label = this.formatMessage(message, messageArgs);

								return (
									<li
										key={player.get("color")}
										className={classnames([
											classes.item,
											{
												[classes.currentPlayerItem]: playerUser.get("isMe"),
												[classes.activeItem]: active && markActive,
												[classes[`activeItem-color-${player.get("color")}`]]: active && markActive,
											}
										])}
										title={label}
										onClick={(event) => this.handlePlayerIndicatorClick(player, event.target)}
										{
										...(
											typeof this.props.indicatorProps === "function" ?
												this.props.indicatorProps({
													player,
													user: playerUser,
													index,
													active,
													isPresent,
												}) :
												this.props.indicatorProps
										)
										}
									>
										<Marble
											color={player.get("color")}
											size={
												!isPresent ?
													MARBLE_SIZE.absent :
													MARBLE_SIZE.normal
											}
										/>
									</li>
								);
							}
						).toArray()
					}
					{
						[
							...Array(
								Math.max(
									game.get("playerLimit") - game.get("players").size,
									0
								)
							)
						].map(
							(val, index) => (
								<li
									key={`not-filled-player-${index}`}
									className={classes.item}
									title={this.formatMessage(messages.indicatorMessages.availableSlot)}
									{
									...(
										typeof this.props.indicatorProps === "function" ?
											this.props.indicatorProps({
												player: null,
												user: null,
												index,
												active: false,
												isPresent: false,
											}) :
											this.props.indicatorProps
									)
									}
								>
									<Marble
										size={MARBLE_SIZE.normal}
										color={null}
									/>
								</li>
							)
						)
					}
				</ul>
			</div>
		);
	}
}

export { PlayerIndicators as Unwrapped };

export default injectIntl(withStyles(styles)(PlayerIndicators));
