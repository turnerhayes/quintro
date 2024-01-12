/* global Promise */

import React, { useCallback }        from "react";
import Switch       from "@mui/material/Switch";
import Notify       from "notifyjs";

import messages     from "./messages";


const NOTIFICATIONS_SUPPORTED = !Notify.needsPermission || Notify.isSupported();


	/**
	 * @member {object} - Component prop types
	 *
	 * @prop {function} onChangeSetting - function called when settings are changed
	 * @prop {boolean} [enableSoundEffects] - whether or not sound effects are enabled
	 * @prop {boolean} [enableNotifications] - whether or not browser notifications are enabled
	 * @prop {boolean} [isLoadingStoredSettings] - whether or not the component is currently loading
	 *	settings from a local store
	 */
	//  static propTypes = {
	// 	intl: intlShape.isRequired,
	// 	onChangeSetting: PropTypes.func.isRequired,
	// 	enableSoundEffects: PropTypes.bool.isRequired,
	// 	enableNotifications: PropTypes.bool.isRequired,
	// 	isLoadingStoredSettings: PropTypes.bool,
	// };

//TODO: FIX
const formatMessage = ({id}: {id: string}, values?: {[key: string]: unknown}) => {
	return id;
};

interface QuickSettingsDialogProps {
	onChangeSetting?: (args: {
		enableSoundEffects?: boolean;
		enableNotifications?: boolean;
	}) => void;
	enableSoundEffects?: boolean;
	enableNotifications?: boolean;
	isLoadingStoredSettings?: boolean;
}

/**
 * Component representing a dialog providing quick access to certain settings.
 *
 * @memberof client.react-components
 */
const QuickSettingsDialog = ({
	onChangeSetting,
	enableSoundEffects = false,
	enableNotifications = false,
	isLoadingStoredSettings = false,
}: QuickSettingsDialogProps) => {
	/**
	 * Toggles whether or not the sound effects setting is enabled.
	 *
	 * @function
	 *
	 * @param {boolean} status - the enabled/disabled status to set it to
	 *
	 * @return {void}
	 */
	const toggleEnableSoundEffects = useCallback((status) => {
		onChangeSetting({
			enableSoundEffects: status
		});
	}, [onChangeSetting]);

	/**
	 * Toggles whether or not the browser notifications setting is enabled.
	 *
	 * @function
	 *
	 * @param {boolean} status - the enabled/disabled status to set it to
	 *
	 * @return {void}
	 */
	const toggleEnableNotifications = useCallback(async (status) => {
		// Turning on notifications
		if (!enableNotifications && status && Notify.needsPermission) {
			const gotPermission = await new Promise(
				(resolve, reject) => {
					Notify.requestPermission(resolve, reject);
				}
			);
			if (!gotPermission) {
				return;
			}
		}
		onChangeSetting({
			enableNotifications: status
		});
	}, [onChangeSetting, enableNotifications]);

	const handleChangeNotifications = useCallback((event) => {
		return toggleEnableNotifications(event.target.checked);
	}, [toggleEnableNotifications]);

	const handleChangeSoundEffects = useCallback((event) => {
		toggleEnableSoundEffects(event.target.checked);
	}, [toggleEnableSoundEffects]);

	return (
		<div>
			<h4>
				{formatMessage(messages.dialogTitle)}
			</h4>
			<div
			>
				<form
				>
					<div
					>
						<label>
							<Switch
								className="notifications-switch"
								checked={enableNotifications}
								onChange={handleChangeNotifications}
								disabled={isLoadingStoredSettings || !NOTIFICATIONS_SUPPORTED}
								aria-label={formatMessage(messages.settingLabels.notifications)}
							/>

							{formatMessage(messages.settingNames.notifications)}
						</label>
					</div>
					<div
					>
						<label>
							<Switch
								className="sound-effects-switch"
								checked={enableSoundEffects}
								onChange={handleChangeSoundEffects}
								disabled={isLoadingStoredSettings}
								aria-label={formatMessage(messages.settingLabels.soundEffects)}
							/>

							{formatMessage(messages.settingNames.soundEffects)}
						</label>
					</div>
				</form>
			</div>
		</div>
	);
}

export { QuickSettingsDialog as Unwrapped };

export default QuickSettingsDialog;
