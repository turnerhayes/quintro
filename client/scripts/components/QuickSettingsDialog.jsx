import Promise     from "bluebird";
import React       from "react";
import PropTypes   from "prop-types";
import Toggle      from "react-toggle";
import { connect } from "react-redux";
import Notify      from "notifyjs";
import {
	changeSetting
}                  from "project/scripts/redux/actions";
import                  "react-toggle/style.css";

const NOTIFICATIONS_SUPPORTED = !Notify.needsPermission || Notify.isSupported();

class QuickSettingsDialog extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		enableSoundEffects: PropTypes.bool,
		enableNotifications: PropTypes.bool,
		enableBackgroundImage: PropTypes.bool,
		isLoadingStoredSettings: PropTypes.bool
	}

	toggleEnableSoundEffects = (status) => {
		this.props.dispatch(changeSetting({
			enableSoundEffects: status
		}));
	}

	toggleEnableBackgroundImage = (status) => {
		this.props.dispatch(changeSetting({
			enableBackgroundImage: status
		}));
	}

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

	render() {
		return (
			<div
				className="c_quick-settings-dialog"
			>
				<h4
				>Quick Settings</h4>
				<div
				>
					<form
					>
						<div
							className="form-group"
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
							className="form-group"
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
						<div
							className="form-group"
						>
							<label>
								<Toggle
									checked={this.props.enableBackgroundImage}
									onChange={(event) => this.toggleEnableBackgroundImage(event.target.checked)}
									disabled={this.props.isLoadingStoredSettings}
								/>

								Background Image
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
			enableBackgroundImage: settings.enableBackgroundImage,
			isLoadingStoredSettings: !settings.wasRehydrated
		};
	}
)(QuickSettingsDialog);
