import React         from "react";
import PropTypes     from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
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
import {
	injectIntl,
	intlShape,
}                    from "react-intl";
import createHelper  from "@app/components/class-helper";
import Config        from "@app/config";
import messages      from "./messages";
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
		game: ImmutablePropTypes.map.isRequired,
		onSubmit: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onWatchGame: PropTypes.func,
		intl: intlShape.isRequired,
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

	formatMessage = (...args) => {
		return this.props.intl.formatMessage(...args);
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

	getDefaultColor = () => {
		const playerColors = this.props.game.get("players").map((player) => player.get("color"));
		const colors = Config.game.colors.filter(
			(colorDefinition) => playerColors.indexOf(colorDefinition.id) < 0
		);

		return colors[0].id;
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
	handleSubmit = (event) => {
		event.preventDefault();

		this.props.onSubmit({
			color: this.state.selectedColor || this.getDefaultColor(),
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
				{reason}.
				<div>
					<Link to="/game/find">Find another game</Link> or <Link to="/game/create">create your own!</Link>
				</div>
				<Button
					color="secondary"
					onClick={this.handleWatchGameButtonClicked}
				>
					{this.formatMessage(messages.buttons.watchGame.label)}
				</Button>
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

		const playerColors = game.get("players").map((player) => player.get("color")).toArray();
		const colors = Config.game.colors.filter(
			(colorDefinition) => playerColors.indexOf(colorDefinition.id) < 0
		);

		const defaultColor = this.getDefaultColor();

		return (
			<form
				onSubmit={this.handleSubmit}
			>
				<div>
					<label
					>
						{this.formatMessage(messages.color)}:
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
						{this.formatMessage(messages.buttons.join.label)}
					</Button>
					<Button
						type="button"
						onClick={this.handleCancelButtonClicked}
					>
						{this.formatMessage(messages.buttons.cancel.label)}
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

		const isFull = game.get("players").size === game.get("playerLimit");

		let body;
		let canJoin = false;

		if (isFull) {
			body = this.renderCannotJoinGame({
				reason: this.formatMessage(messages.cannotJoinReasons.gameIsFull),
			});
		}
		else if (this.props.game.get("isStarted")) {
			body = this.renderCannotJoinGame({
				reason: this.formatMessage(messages.cannotJoinReasons.gameIsInProgress),
			});
		}
		else {
			body = this.renderPlayerForm();
			canJoin = true;
		}

		return (
			<Dialog
				{...classes()}
				open
			>
				<Card>
					{ canJoin && (
						<CardHeader
							title={this.formatMessage(messages.joinThisGamePrompt)}
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

export default injectIntl(GameJoinDialog);
