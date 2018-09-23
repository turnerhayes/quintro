import React         from "react";
import PropTypes     from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { Link }      from "react-router-dom";
import Dialog        from "@material-ui/core/Dialog";
import Card          from "@material-ui/core/Card";
import CardHeader    from "@material-ui/core/CardHeader";
import CardContent   from "@material-ui/core/CardContent";
import Button        from "@material-ui/core/Button";
import {
	injectIntl,
	intlShape,
	FormattedMessage,
}                    from "react-intl";

import ColorPicker   from "@app/components/ColorPicker";
import Config        from "@app/config";

import messages      from "./messages";

const getPlayerColors = (game) => game.get("players").map((player) => player.get("color"));

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
	 * @prop {?string} selectedColor=null - the color ID of the chosen player color (if one is selected)
	 */
	state = {
		selectedColor: null
	}

	formatMessage = (...args) => {
		return this.props.intl.formatMessage(...args);
	}

	getDefaultColor = () => {
		const playerColors = getPlayerColors(this.props.game);
		const colors = Config.game.colors.filter(
			(colorDefinition) => playerColors.indexOf(colorDefinition.id) < 0
		);
			
		return colors[0].id;
	}

	colorFilter = ({ id }) => getPlayerColors(this.props.game).indexOf(id) < 0

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

	handleColorChosen = ({ color }) => {
		this.setState({
			selectedColor: color,
		});
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
					<FormattedMessage
						{...messages.cannotJoinActions}
						values={{
							findGameLink: (
								<Link
									to="/game/find"
								>
									<FormattedMessage
										{...messages.findGameLinkText}
									/>
								</Link>
							),

							createGameLink: (
								<Link
									to="/game/create"
								>
									<FormattedMessage
										{...messages.createGameLinkText}
									/>
								</Link>
							),
						}}
					/>
				</div>
				<Button
					className="watch-game-button"
					color="secondary"
					onClick={this.handleWatchGameButtonClicked}
				>
					<FormattedMessage
						{...messages.buttons.watchGame.label}
					/>
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
		return (
			<form
				onSubmit={this.handleSubmit}
			>
				<div>
					<label
					>
						<FormattedMessage
							{...messages.color}
						/>:
						<ColorPicker
							getDefaultColor={this.getDefaultColor}
							colorFilter={this.colorFilter}
							selectedColor={this.state.selectedColor}
							onColorChosen={this.handleColorChosen}
						/>
					</label>
				</div>
				<div
				>
					<Button
						className="submit-button"
						type="submit"
						color="primary"
					>
						<FormattedMessage
							{...messages.buttons.join.label}
						/>
					</Button>
					<Button
						className="cancel-button"
						type="button"
						onClick={this.handleCancelButtonClicked}
					>
						<FormattedMessage
							{...messages.buttons.cancel.label}
						/>
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

export { GameJoinDialog as Unwrapped };

export default injectIntl(GameJoinDialog);
