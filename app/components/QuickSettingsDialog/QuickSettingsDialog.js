/* global Promise */

import React        from "react";
import PropTypes    from "prop-types";
import Switch       from "@material-ui/core/Switch";
import Notify       from "notifyjs";
import {
	injectIntl,
	intlShape,
	FormattedMessage,
}                   from "react-intl";

import messages     from "./messages";


const NOTIFICATIONS_SUPPORTED = !Notify.needsPermission || Notify.isSupported();

/**
 * Component representing a dialog providing quick access to certain settings.
 *
 * @class
 * @extends external:React.PureComponent
 *
 * @memberof client.react-components
 */
class QuickSettingsDialog extends React.PureComponent {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {function} onChangeSetting - function called when settings are changed
	 * @prop {boolean} [enableSoundEffects] - whether or not sound effects are enabled
	 * @prop {boolean} [enableNotifications] - whether or not browser notifications are enabled
	 * @prop {boolean} [isLoadingStoredSettings] - whether or not the component is currently loading
	 *	settings from a local store
	 */
	static propTypes = {
		intl: intlShape.isRequired,
		onChangeSetting: PropTypes.func.isRequired,
		enableSoundEffects: PropTypes.bool.isRequired,
		enableNotifications: PropTypes.bool.isRequired,
		isLoadingStoredSettings: PropTypes.bool,
	}

	static defaultProps = {
		enableSoundEffects: false,
		enableNotifications: false,
	}

	formatMessage = (...args) => {
		return this.props.intl.formatMessage(...args);
	}

	/**
	 * Toggles whether or not the sound effects setting is enabled.
	 *
	 * @function
	 *
	 * @param {boolean} status - the enabled/disabled status to set it to
	 *
	 * @return {void}
	 */
	toggleEnableSoundEffects = (status) => {
		this.props.onChangeSetting({
			enableSoundEffects: status
		});
	}

	/**
	 * Toggles whether or not the browser notifications setting is enabled.
	 *
	 * @function
	 *
	 * @param {boolean} status - the enabled/disabled status to set it to
	 *
	 * @return {void}
	 */
	toggleEnableNotifications = (status) => {
		// If we don't need to actually get permission, this will
		// resolve immediately with `false`
		return Promise.resolve(
			// Turning on notifications
			!this.props.enableNotifications && status &&
				Notify.needsPermission &&
				new Promise(
					(resolve, reject) => {
						Notify.requestPermission(resolve, reject);
					}
				)
		).then(
			() => {
				this.props.onChangeSetting({
					enableNotifications: status
				});
			}
		);
	}

	handleChangeNotifications = (event) => {
		return this.toggleEnableNotifications(event.target.checked);
	}

	handleChangeSoundEffects = (event) => {
		this.toggleEnableSoundEffects(event.target.checked);
	}

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		return (
			<div>
				<FormattedMessage
					tagName="h4"
					{...messages.dialogTitle}
				/>
				<div
				>
					<form
					>
						<div
						>
							<label>
								<Switch
									className="notifications-switch"
									checked={this.props.enableNotifications}
									onChange={this.handleChangeNotifications}
									disabled={this.props.isLoadingStoredSettings || !NOTIFICATIONS_SUPPORTED}
									aria-label={this.formatMessage(messages.settingLabels.notifications)}
								/>

								{this.formatMessage(messages.settingNames.notifications)}
							</label>
						</div>
						<div
						>
							<label>
								<Switch
									className="sound-effects-switch"
									checked={this.props.enableSoundEffects}
									onChange={this.handleChangeSoundEffects}
									disabled={this.props.isLoadingStoredSettings}
									aria-label={this.formatMessage(messages.settingLabels.soundEffects)}
								/>

								{this.formatMessage(messages.settingNames.soundEffects)}
							</label>
						</div>
					</form>
				</div>
			</div>
		);
	}
}

export { QuickSettingsDialog as Unwrapped };

export default injectIntl(QuickSettingsDialog);
