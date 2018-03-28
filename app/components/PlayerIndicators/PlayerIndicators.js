import React              from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import PropTypes          from "prop-types";
import { Map }            from "immutable";
import Popover            from "material-ui/Popover";
import Config             from "@app/config";
import createHelper       from "@app/components/class-helper";
import PlayerInfoPopup    from "@app/containers/PlayerInfoPopup";
import LoadingSpinner     from "@app/components/LoadingSpinner";
import                         "./PlayerIndicators.less";

const classes = createHelper("player-indicators");

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
	 * @prop {boolean} [markCurrent] - whether or not to distinguish which player is the current player
	 * @prop {client.react-components.PlayerIndicators~onIndicatorClicked} [onPlayerIndicatorClicked] - handler
	 *	for when an indicator is clicked
	 */
	static propTypes = {
		game: ImmutablePropTypes.map,

		markCurrent: PropTypes.bool,

		onIndicatorClicked: PropTypes.func
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
			markCurrent,
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
				{...classes({
					extra: [
						markCurrent && "mark-current",
					],
				})}
			>
				<ul
					{...classes({
						element: "list",
					})}
				>
					{
						game.get("players").toList().sortBy((player) => player.get("order")).map(
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
										{...classes({
											element: "item",
											extra: [
												active && "active",
												player.getIn(["user", "isMe"]) && "current-player",
												!isPresent && "absent",
											],
										})}
										title={label}
										onClick={(event) => this.handlePlayerIndicatorClicked(player, event.target)}
									>
										<div
											{...classes({
												element: "marble",
												extra: [
													Config.game.colors.get(player.get("color")).id,
												],
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
									{...classes({
										element: "item",
									})}
									title="This spot is open for another player"
								>
									<div
										{...classes({
											element: "marble",
											extra: [
												"not-filled"
											],
										})}
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

export default PlayerIndicators;
