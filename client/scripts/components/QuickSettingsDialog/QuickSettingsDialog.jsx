import Promise      from "bluebird";
import React        from "react";
import PropTypes    from "prop-types";
import Toggle       from "react-toggle";
import { connect }  from "react-redux";
import Notify       from "notifyjs";
import createHelper from "project/scripts/components/class-helper";
import {
	changeSetting
}                   from "project/scripts/redux/actions";
import                   "react-toggle/style.css";

const classes = createHelper("quick-settings-dialog");

const NOTIFICATIONS_SUPPORTED = !Notify.needsPermission || Notify.isSupported();

/**
 * Component representing a dialog providing quick access to certain settings.
 *
 * @extends external:React.Component
 *
 * @memberof client.react-components
 */
class QuickSettingsDialog extends React.Component {
	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {function} dispatch - function to dispatch actions to the Redux store
	 * @prop {boolean} [enableSoundEffects] - whether or not sound effects are enabled
	 * @prop {boolean} [enableNotifications] - whether or not browser notifications are enabled
	 * @prop {boolean} [isLoadingStoredSettings] - whether or not the component is currently loading
	 *	settings from a local store
	 */
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		enableSoundEffects: PropTypes.bool,
		enableNotifications: PropTypes.bool,
		isLoadingStoredSettings: PropTypes.bool
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
		this.props.dispatch(changeSetting({
			enableSoundEffects: status
		}));
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
				this.props.dispatch(changeSetting({
					enableNotifications: status
				}));
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
								<Toggle
									checked={this.props.enableNotifications}
									onChange={(event) => this.toggleEnableNotifications(event.target.checked)}
									disabled={this.props.isLoadingStoredSettings || !NOTIFICATIONS_SUPPORTED}
								/>

								Notifications
							</label>
						</div>
						<div
						>
							<label>
								<Toggle
									checked={this.props.enableSoundEffects}
									onChange={(event) => this.toggleEnableSoundEffects(event.target.checked)}
									disabled={this.props.isLoadingStoredSettings}
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

export default connect(
	function mapStateToProps(state) {
		const settings = state.get("settings");

		return {
			enableSoundEffects: settings.enableSoundEffects,
			enableNotifications: settings.enableNotifications,
			isLoadingStoredSettings: !settings.wasRehydrated
		};
	}
)(QuickSettingsDialog);
