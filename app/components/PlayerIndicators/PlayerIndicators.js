import React              from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import PropTypes          from "prop-types";
import { Map }            from "immutable";
import Popover            from "material-ui/Popover";
import { withStyles }     from "material-ui/styles";
import classnames         from "classnames";
import PlayerInfoPopup    from "@app/containers/PlayerInfoPopup";
import LoadingSpinner     from "@app/components/LoadingSpinner";
import Marble             from "@app/components/Marble";

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

	activeMarble: {
		boxShadow: "#C3C374 0px 0px 20px 6px",
	},
};

/**
 * @callback client.react-components.PlayerIndicators~onIndicatorClicked
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
	 * @prop {client.react-components.PlayerIndicators~onIndicatorClicked} [onPlayerIndicatorClicked] - handler
	 *	for when an indicator is clicked
	 */
	static propTypes = {
		game: ImmutablePropTypes.map,

		markActive: PropTypes.bool,

		onIndicatorClicked: PropTypes.func,

		classes: PropTypes.object,
	}

	/**
	 * Component state
	 *
	 * @type object
	 *
	 * @prop {string} selectedPlayerColor=null - the color ID of the color that is currently selected (has the
	 *	player info popover opened)
	 * @prop {string} selectedIndicatorEl=null - the DOM element corresponding to the selected color's indicator
	 */
	state = {
		selectedPlayerColor: null,
		selectedIndicatorEl: null,
	}

	/**
	 * Toggles the player info popover open or closed for the specified color.
	 *
	 * If no popover is currently open, or if the popover is open for another color, it will open the popover for the
	 * specified color (and close it for the other color, if it is currently open). Otherwise, it will close the
	 * popover.
	 *
	 * @function
	 *
	 * @param {string} color - the color ID of the color for which to open the popover
	 *
	 * @return {void}
	 */
	togglePopoverOpened = (color) => {
		if (this.state.selectedPlayerColor && this.state.selectedPlayerColor === color) {
			this.setState({ selectedPlayerColor: null });
		}
		else {
			this.setState({ selectedPlayerColor: color });
		}
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
	handlePlayerIndicatorClicked = (selectedPlayer, element) => {
		this.setState({
			selectedIndicatorEl: element,
		});
		this.togglePopoverOpened((selectedPlayer && selectedPlayer.get("color")) || null);
		this.props.onIndicatorClicked && this.props.onIndicatorClicked({ selectedPlayer });
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
			selectedPlayerColor,
			selectedIndicatorEl,
		} = this.state;

		const {
			game,
			markActive,
			classes,
		} = this.props;

		if (game.get("players").isEmpty()) {
			return (<LoadingSpinner />);
		}

		const playerMap = game.get("players").reduce(
			(playerMap, player) => playerMap.set(player.get("color"), player),
			Map()
		);

		return (
			<div
				className={classes.root}
			>
				<ul
					className={classes.list}
				>
					{
						game.get("players").map(
							(player) => {
								const active = player.get("color") === game.get("currentPlayerColor");
								const isPresent = !!game.getIn(["playerPresence", player.get("color")]);

								const label = player.getIn(["user", "isMe"]) ?
									"This is you" :
									(
										(player.getIn(["user", "name", "display" ]) || `Player ${player.get("color")}`)  +
										(isPresent ? "" : " is absent")
									);

								return (
									<li
										key={player.get("color")}
										className={classnames([
											classes.item,
											{
												[classes.currentPlayerItem]: player.getIn(["user", "isMe"]),
											}
										])}
										title={label}
										onClick={(event) => this.handlePlayerIndicatorClicked(player, event.target)}
									>
										<Marble
											color={player.get("color")}
											size={
												!isPresent ?
													MARBLE_SIZE.absent :
													MARBLE_SIZE.normal
											}
											className={markActive && classnames({
												[classes.activeMarble]: active,
											})}
										/>
									</li>
								);
							}
						).toArray()
					}
					<Popover
						open={!!selectedIndicatorEl}
						onClose={() => this.setState({
							selectedIndicatorEl: null,
							selectedPlayerColor: null,
						})}
						anchorEl={selectedIndicatorEl}
						anchorOrigin={{
							vertical: "bottom",
							horizontal: "center",
						}}
						transformOrigin={{
							vertical: "top",
							horizontal: "left",
						}}
					>
						{
							selectedPlayerColor && (
								<PlayerInfoPopup
									game={game}
									player={playerMap.get(selectedPlayerColor)}
								/>
							)
						}
					</Popover>
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
									title="This spot is open for another player"
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

export default withStyles(styles)(PlayerIndicators);
