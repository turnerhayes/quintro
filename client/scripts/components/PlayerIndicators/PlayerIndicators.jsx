import React              from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import PropTypes          from "prop-types";
import { Map }            from "immutable";
import Popover            from "material-ui/Popover";
import Config             from "project/scripts/config";
import PlayerRecord       from "project/scripts/records/player";
import createHelper       from "project/scripts/components/class-helper";
import PlayerInfoPopup    from "project/scripts/components/PlayerInfoPopup";
import                         "./PlayerIndicators.less";

const classes = createHelper("player-indicators");

/**
 * @callback client.react-components.PlayerIndicators~onIndicatorClicked
 *
 * @param {object} args - the function arguments
 * @param {client.records.PlayerRecord} args.selectedPlayer - the player whose indicator was clicked
 *
 * @return {void}
 */

/**
 * Component representing a set of indicators for visualizing the state of the
 * players in the game.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class PlayerIndicators extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {external:Immutable.List<client.records.PlayerRecord>} players - list of players in the game
	 * @prop {number} playerLimit - maximum number of players in the game
	 * @prop {string} [currentPlayerColor] - the id of the color whose turn it currently is
	 * @prop {boolean} [markCurrent] - whether or not to distinguish which player is the current player
	 * @prop {client.react-components.PlayerInfoPopup~onDisplayNameChange} [onDisplayNameChange] - handler
	 *	for when an anonymous user wants changes their display name
	 * @prop {client.react-components.PlayerIndicators~onIndicatorClicked} [onPlayerIndicatorClicked] - handler
	 *	for when an indicator is clicked
	 */
	static propTypes = {
		players: ImmutablePropTypes.listOf(
			PropTypes.instanceOf(PlayerRecord)
		).isRequired,

		playerLimit: PropTypes.number.isRequired,

		currentPlayerColor: PropTypes.string,

		markCurrent: PropTypes.bool,

		onDisplayNameChange: PropTypes.func,

		onIndicatorClicked: PropTypes.func
	}

	/**
	 * Component state
	 *
	 * @type object
	 *
	 * @prop {string} selectedPlayerColor=null - the color ID of the color that is currently selected (has the
	 *	player info popover opened)
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
	 * @param {string} color - the color ID of the color to open the popover for
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
	 *
	 * @return {void}
	 */
	handlePlayerIndicatorClicked = (selectedPlayer, element) => {
		this.setState({
			selectedIndicatorEl: element,
		});
		this.togglePopoverOpened((selectedPlayer && selectedPlayer.color) || null);
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
			players,
			playerLimit,
			currentPlayerColor,
			markCurrent,
			onDisplayNameChange,
		} = this.props;

		const playerMap = players.reduce(
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
						players.map(
							(player) => {
								const active = player.color === currentPlayerColor;

								const label = player.user.isMe ?
									"This is you" :
									(
										(player.user.name && player.user.name.get("display")) || `Player ${player.color}`  +
										(player.isPresent ? "" : " is absent")
									);

								return (
									<li
										key={player.color}
										{...classes({
											element: "item",
											extra: [
												active && "active",
												player.user.isMe && "current-player",
												!player.isPresent && "absent",
											],
										})}
										title={label}
										onClick={(event) => this.handlePlayerIndicatorClicked(player, event.target)}
									>
										<div
											{...classes({
												element: "marble",
												extra: [
													Config.game.colors.get(player.color).id,
												],
											})}
										/>
									</li>
								);
							}
						).toList().sortBy((player) => player.order).toArray()
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
									player={playerMap.get(selectedPlayerColor)}
									onDisplayNameChange={onDisplayNameChange}
								/>
							)
						}
					</Popover>
					{
						[
							...Array(
								Math.max(
									playerLimit - players.size,
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
