import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import Card               from "@material-ui/core/Card";
import CardHeader         from "@material-ui/core/CardHeader";
import CardContent        from "@material-ui/core/CardContent";
import TextField          from "@material-ui/core/TextField";
import InputAdornment     from "@material-ui/core/InputAdornment";
import IconButton         from "@material-ui/core/IconButton";
import EditIcon           from "@material-ui/icons/Edit";
import CloseIcon          from "@material-ui/icons/Close";
import CheckIcon          from "@material-ui/icons/Check";
import { Link }           from "react-router-dom";
import {
	injectIntl,
	intlShape,
}                         from "react-intl";

import messages           from "./messages";

/**
 * @callback client.react-components.PlayerInfoPopup~onDisplayNameChange
 *
 * @param {object} args - the function arguments
 * @param {client.records.PlayerRecord} player - the player whose display name is being changed
 * @param {string} displayName - the display name entered
 *
 * @return {void}
 */

/**
 * @callback client.react-components.PlayerInfoPopup~toggle
 *
 * @return {void}
 */

/**
 * Component representing a popup displaying information about a player.
 *
 * @class
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
class PlayerInfoPopup extends React.PureComponent {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {external:Immutable.Map} player - the player whose information is displayed
	 * @prop {boolean} isOpen - whether or not the popup is open
	 * @prop {client.react-components.PlayerInfoPopup~onDisplayNameChange} [onDisplayNameChange] - handler
	 *	for when an anonymous user wants changes their display name
	 */
	static propTypes = {
		player: ImmutablePropTypes.map.isRequired,

		playerUser: ImmutablePropTypes.map.isRequired,

		onDisplayNameChange: PropTypes.func.isRequired,

		intl: intlShape.isRequired,
	}

	/**
	 * Component state
	 *
	 * @type object
	 *
	 * @prop {boolean} isFormVisible=false - whether or not the change display name form is visible
	 */
	state = {
		isFormVisible: false,
		displayNameValue: this.props.playerUser.getIn(["name", "display"]) || "",
	}

	formatMessage = (messageDescriptor, values) => {
		return this.props.intl.formatMessage(messageDescriptor, values);
	}

	/**
	 * Handles submission of the change display name form.
	 *
	 * @function
	 *
	 * @param {event} event - the submit event
	 *
	 * @return {void}
	 */
	handleChangeDisplayNameFormSubmit = (event) => {
		event.preventDefault();

		this.props.onDisplayNameChange && this.props.onDisplayNameChange({
			player: this.props.player,
			displayName: this.state.displayNameValue,
		});

		this.makeFormHidden();
	}

	makeFormVisible = () => {
		this.setState({ isFormVisible: true });
	}

	makeFormHidden = () => {
		this.setState({ isFormVisible: false });
	}

	textFieldRef = (ref) => {
		ref && ref.focus();
	}

	handleDisplayNameChange = ({ target }) => {
		this.setState({ displayNameValue: target.value });
	}

	/**
	 * Renders the change display name form.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	renderDisplayNameForm = () => {
		const submitButtonTitle = this.formatMessage(messages.displayNameInputSubmitButtonTitle);
		const cancelButtonTitle = this.formatMessage(messages.displayNameInputCancelButtonTitle);

		return (
			<form
				onSubmit={this.handleChangeDisplayNameFormSubmit}
			>
				<TextField
					label={this.formatMessage(messages.displayNameInputLabel)}
					name="name"
					inputRef={this.textFieldRef}
					value={this.state.displayNameValue}
					onChange={this.handleDisplayNameChange}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<IconButton
									title={submitButtonTitle}
									aria-label={submitButtonTitle}
									type="submit"
								>
									<CheckIcon />
								</IconButton>
								<IconButton
									key="close icon"
									onClick={this.makeFormHidden}
									title={cancelButtonTitle}
									aria-label={cancelButtonTitle}
								>
									<CloseIcon />
								</IconButton>
							</InputAdornment>
						)
					}}
				/>
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
			isFormVisible,
		} = this.state;

		let content = null;
		if (this.props.playerUser.get("isAnonymous")) {
			if (this.props.playerUser.get("isMe") && isFormVisible) {
				content = this.renderDisplayNameForm();
			}
		}
		else {
			content = (
				<Link
					to={`/profile/${this.props.playerUser.get("username")}`}
					target="_blank"
				>
					{this.formatMessage(messages.profileLink)}
				</Link>
			);
		}

		const showFormButtonTitle = this.formatMessage(messages.showFormButtonTitle);

		return (
			<Card>
				<CardHeader
					title={(
						<div>
							<span>
								{
									this.props.playerUser.getIn(["name", "display"]) ||
									this.formatMessage(messages.anonymousUserTitle)
								}
							</span>
							{
								!this.state.isFormVisible &&
								this.props.playerUser.get("isAnonymous") &&
								this.props.playerUser.get("isMe") && (
									<IconButton
										key="edit icon"
										title={showFormButtonTitle}
										aria-label={showFormButtonTitle}
										onClick={this.makeFormVisible}
									>
										<EditIcon
										/>
									</IconButton>
								)
							}
						</div>
					)}
				/>
				{
					content && (
						<CardContent>
							{content}
						</CardContent>
					)
				}
			</Card>
		);
	}
}

export { PlayerInfoPopup as Unwrapped };

export default injectIntl(PlayerInfoPopup);
