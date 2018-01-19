import React         from "react";
import PropTypes     from "prop-types";
import { Link }      from "react-router-dom";
import Dialog        from "material-ui/Dialog";
import Card, {
	CardHeader,
	CardContent
}                    from "material-ui/Card";
import Menu, {
	MenuItem
}                    from "material-ui/Menu";
import Button        from "material-ui/Button";
import createHelper  from "project/scripts/components/class-helper";
import Config        from "project/scripts/config";
import GameRecord    from "project/scripts/records/game";
import                    "./GameJoinDialog.less";

const classes = createHelper("game-join-dialog");

/**
 * @callback client.react-components.GameJoinDialog~onSubmitCallback
 *
 * @param {string} color - the color ID of the color to use for the current player on joining
 *
 * @return {void}
 */

/**
 * @callback client.react-components.GameJoinDialog~onCancelCallback
 *
 * @return {void}
 */

/**
 * @callback client.react-components.GameJoinDialog~onWatchGameCallback
 *
 * @return {void}
 */

/**
 * Component representing a dialog used to join a game.
 *
 * @class
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class GameJoinDialog extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {client.records.GameRecord} game - the game to join
	 * @prop {client.react-components.GameJoinDialog~onSubmitCallback} onSubmit - callback
	 *	to handle the request to complete joining the game
	 * @prop {client.react-components.GameJoinDialog~onCancelCallback} onCancel - callback
	 *	to handle the request to abort joining the game
	 * @prop {client.react-components.GameJoinDialog~onWatchGameCallback} [onWatchGame] - callback
	 *	to handle the request to watch the game without playing
	 */
	static propTypes = {
		game: PropTypes.instanceOf(GameRecord).isRequired,
		onSubmit: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onWatchGame: PropTypes.func
	}

	/**
	 * Component state
	 *
	 * @type object
	 *
	 * @prop {boolean} colorPickerIsOpen=false - whether the player color dropdown is expanded
	 * @prop {?string} selectedColor=null - the color ID of the chosen player color (if one is selected)
	 */
	state = {
		colorDisplayEl: null,
		colorPickerIsOpen: false,
		selectedColor: null
	}

	/**
	 * Closes the player color dropdown.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	closeColorPicker = () => {
		this.setState({ colorPickerIsOpen: false });
	}

	/**
	 * Handles a player color being clicked.
	 *
	 * @function
	 *
	 * @param {object} args - the function arguments
	 * @param {object} args.colorDefinition - the color definition object for
	 *	the selected color
	 *
	 * @return {void}
	 */
	handleColorClicked = ({ colorDefinition }) => {
		this.setState({ selectedColor: colorDefinition.id });
		this.closeColorPicker();
	}

	/**
	 * Handles the cancel button being clicked.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handleCancelButtonClicked = () => {
		this.props.onCancel();
	}

	/**
	 * Handles the watch game button being clicked.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handleWatchGameButtonClicked = () => {
		this.props.onWatchGame && this.props.onWatchGame();
	}

	/**
	 * Handles the submit button being clicked.
	 *
	 * @function
	 *
	 * @return {void}
	 */
	handleSubmit = ({ event, defaultColor }) => {
		event.preventDefault();

		this.props.onSubmit({
			color: this.state.selectedColor || defaultColor
		});
	}

	/**
	 * Renders an option for the color picker dropdown.
	 *
	 * @function
	 *
	 * @param {object} colorDefinition - the color definition object for the color to render
	 * @param {object} [rootProps] - additional props to add to the wrapper element
	 *
	 * @return {external:React.Component} the picker item element to render
	 */
	renderColorOptionContent = (colorDefinition, rootProps) => {
		return (
			<span
				{...rootProps}
			>
				<span
					{...classes({
						element: "color-swatch",
					})}
					style={{backgroundColor: colorDefinition.hex}}
				/>
				{colorDefinition.name}
			</span>
		);
	}

	/**
	 * Renders the content of the dialog for the case when the user is not allowed to join the game.
	 *
	 * @function
	 *
	 * @param {object} args - the function arguments
	 * @param {string} reason - a string containing a message explaining why the user could not join
	 *	the game
	 *
	 * @return {external:React.Component} the dialog content to render
	 */
	renderCannotJoinGame = ({ reason }) => {
		return (
			<div>
				Sorry, { reason }
				<div>
					<Link to="/game/find">Find another game</Link> or <Link to="/game/create">create your own!</Link>
				</div>
				<Button
					color="secondary"
					onClick={this.handleWatchGameButtonClicked}
				>I want to watch this game</Button>
			</div>
		);
	}

	/**
	 * Renders the player entry form.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the dialog content to render
	 */
	renderPlayerForm = () => {
		const {
			game,
		} = this.props;

		const {
			selectedColor,
			colorPickerIsOpen,
			colorDisplayEl,
		} = this.state;

		const playerColors = game.players.map((player) => player.color).toArray();
		const colors = Config.game.colors.filter(
			(colorDefinition) => playerColors.indexOf(colorDefinition.id) < 0
		);

		const defaultColor = colors[0].id;

		return (
			<form
				method="POST"
				onSubmit={(event) => this.handleSubmit({ event, defaultColor })}
			>
				<div>
					<label
					>
						Color:
						{
							<Button>
							{
								this.renderColorOptionContent(
									Config.game.colors.get(selectedColor || defaultColor),
									{
										onClick: ({ target }) => this.setState({
											colorDisplayEl: target,
											colorPickerIsOpen: true,
										}),
									}
								)
							}
							</Button>
						}
						<Menu
							open={colorPickerIsOpen}
							onClose={this.closeColorPicker}
							anchorEl={colorDisplayEl}
						>
							{
								colors.map(
									(colorDefinition) => {
										return (
											<MenuItem
												key={colorDefinition.id}
												selected={colorDefinition.id === (selectedColor || defaultColor)}
												onClick={() => this.handleColorClicked({
													colorDefinition
												})}
											>
												{ this.renderColorOptionContent(colorDefinition) }
											</MenuItem>
										);
									}
								)
							}
						</Menu>
					</label>
				</div>
				<div
				>
					<Button
						type="submit"
						color="primary"
					>
						Join
					</Button>
					<Button
						type="button"
						onClick={this.handleCancelButtonClicked}
					>
						Cancel
					</Button>
				</div>
			</form>
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
		const {
			game,
		} = this.props;

		const isFull = game.players.size === game.playerLimit;

		let body;
		let canJoin = false;

		if (isFull) {
			body = this.renderCannotJoinGame({
				reason: "this game is full."
			});
		}
		else if (this.props.game.isStarted) {
			body = this.renderCannotJoinGame({
				reason: "this game is already in progress."
			});
		}
		else {
			body = this.renderPlayerForm();
			canJoin = true;
		}

		return (
			<Dialog
				{...classes()}
				open={true}
			>
				<Card>
					{ canJoin && (
						<CardHeader
							title="Join this game"
						/>
					) }
					<CardContent>
					{ body }
					</CardContent>
				</Card>
			</Dialog>
		);
	}
}

export default GameJoinDialog;
