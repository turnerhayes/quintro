import React          from "react";
import PropTypes      from "prop-types";
import Card, {
	CardContent,
	CardHeader,
}                     from "material-ui/Card";
import TextField      from "material-ui/TextField";
import EditIcon       from "material-ui-icons/Edit";
import { withRouter } from "react-router";
import { Link }       from "react-router-dom";
import PlayerRecord   from "project/scripts/records/player";
import createHelper   from "project/scripts/components/class-helper";

const classes = createHelper("player-info-popup");

let uniqueId = 0;

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
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class PlayerInfoPopup extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {object} location - route location, as passed by `react-router-dom`
	 * @prop {client.records.PlayerRecord} player - the player whose information is displayed
	 * @prop {string} target - the ID of the DOM element to which the popup is attached
	 * @prop {boolean} isOpen - whether or not the popup is open
	 * @prop {client.react-components.PlayerInfoPopup~toggle} [toggle] - function called to toggle the popover
	 *	open or closed by changing `isOpen`
	 * @prop {client.react-components.PlayerInfoPopup~onDisplayNameChange} [onDisplayNameChange] - handler
	 *	for when an anonymous user wants changes their display name
	 *
	 * @see {@link https://reacttraining.com/react-router/web/api/location|React Router docs}
	 *	for the shape of the `location` object
	 */
	static propTypes = {
		location: PropTypes.shape({
			pathname: PropTypes.string,
		}).isRequired,

		player: PropTypes.instanceOf(PlayerRecord).isRequired,

		onDisplayNameChange: PropTypes.func,
	}

	/**
	 * Component state
	 *
	 * @type object
	 *
	 * @prop {boolean} isFormEditable=false - whether or not the change display name form is in an editable state
	 *	or not
	 */
	state = {
		isFormEditable: false
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
			displayName: this.displayNameInputEl.value
		});
	}

	/**
	 * Renders the change display name form.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	renderDisplayNameForm = () => {
		if (!this._uniqueId) {
			this._uniqueId = ++uniqueId;
		}

		const {
			isFormEditable,
		} = this.state;

		const {
			location,
			player,
		} = this.props;

		const fieldId = classes({
			element: `set-display-name-form-input-${this._uniqueId}`,
		}).className;

		return (
			<form
				action={location.pathname}
				method="PATCH"
				onSubmit={this.handleChangeDisplayNameFormSubmit}
			>
				{
					isFormEditable ?
						(
							<div
							>
								<label
									htmlFor={fieldId}
								>
									My name
								</label>
								<TextField
									id={fieldId}
									placeholder="My name"
									ref={(displayNameInputEl) => this.displayNameInputEl = displayNameInputEl}
									defaultValue={(player.user.name && player.user.name.get("display")) || ""}
									onBlur={() => this.setState({ isFormEditable: false })}
								/>
							</div>
						) :
						(
							<span
								tabIndex={0}
								onFocus={() => this.setState({ isFormEditable: true })}
							>
								{(player.user.name && player.user.name.get("display")) || ""}
								<EditIcon
								/>
							</span>
						)
				}
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
		const user = this.props.player.user;
		const content = this.props.player.user.isAnonymous ?
			(
				user.isMe ?
					this.renderDisplayNameForm() :
					null
			) :
			(
				<Link
					to={`/profile/${user.username}`}
				>
					Profile
				</Link>
			);

		return (
			<Card>
				{
					user.name && (
						<CardHeader
							title={(user.name.get("display")) || "Anonymous User"}
						/>
					)
				}
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

export default withRouter(PlayerInfoPopup);
