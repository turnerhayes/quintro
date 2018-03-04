/* global Promise */

import React        from "react";
import PropTypes    from "prop-types";
import Switch       from "material-ui/Switch";
import Notify       from "notifyjs";
import createHelper from "@app/components/class-helper";

const classes = createHelper("quick-settings-dialog");

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
		onChangeSetting: PropTypes.func.isRequired,
		enableSoundEffects: PropTypes.bool.isRequired,
		enableNotifications: PropTypes.bool.isRequired,
		isLoadingStoredSettings: PropTypes.bool
	}

	static defaultProps = {
		enableSoundEffects: false,
		enableNotifications: false,
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
		Promise.resolve(
			// Turning on notifications
			!this.props.enableNotifications && status &&
				Notify.needsPermission && new Promise(
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

	/**
	 * Renders the component.
	 *
	 * @function
	 *
	 * @return {external:React.Component} the component to render
	 */
	render() {
		return (
			<div
				{...classes()}
			>
				<h4
				>Quick Settings</h4>
				<div
				>
					<form
					>
						<div
						>
							<label>
								<Switch
									checked={this.props.enableNotifications}
									onChange={(event) => this.toggleEnableNotifications(event.target.checked)}
									disabled={this.props.isLoadingStoredSettings || !NOTIFICATIONS_SUPPORTED}
									aria-label="Enable Browser Notifications"
								/>

								Notifications
							</label>
						</div>
						<div
						>
							<label>
								<Switch
									checked={this.props.enableSoundEffects}
									onChange={(event) => this.toggleEnableSoundEffects(event.target.checked)}
									disabled={this.props.isLoadingStoredSettings}
									aria-label="Enable Sound Effects"
								/>

								Sound Effects
							</label>
						</div>
					</form>
				</div>
			</div>
		);
	}
}

export default QuickSettingsDialog;
