import React, { useCallback }        from "react";
import Switch       from "@mui/material/Switch";
import {useIntl, FormattedMessage} from "react-intl";


const notificationsSupported = () => "Notification" in window;

const requestNotificationPermissions = async () => {
	if (!notificationsSupported()) {
		return false;
	}

	if (Notification.permission === "granted") {
		return true;
	}

	if (Notification.permission === "denied") {
		return false;
	}

	const result = await Notification.requestPermission();

	return result === "granted";
}

const needsPermission = () => Notification.permission !== "granted" && Notification.permission !== "denied";

export interface QuickSettingsDialogProps {
	onChangeSetting: (args: {
		enableSoundEffects?: boolean;
		enableNotifications?: boolean;
	}) => void;
	soundEffectsEnabled?: boolean;
	notificationsEnabled?: boolean;
	isLoadingStoredSettings?: boolean;
}

/**
 * Component representing a dialog providing quick access to certain settings.
 *
 * @memberof client.react-components
 */
const QuickSettingsDialog = ({
	onChangeSetting,
	soundEffectsEnabled: enableSoundEffects = false,
	notificationsEnabled: enableNotifications = false,
	isLoadingStoredSettings = false,
}: QuickSettingsDialogProps) => {
	const intl = useIntl();

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
		if (!enableNotifications && status && needsPermission()) {
			const gotPermission = await requestNotificationPermissions();
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

	const notificationsSwitchLabel = intl.formatMessage({
		id: "quintro.components.QuickSettingsDialog.settingLabels.notifications",
		description: "Label for the switch to enable notifications in the Quick Settings dialog",
		defaultMessage: "Enable Browser Notifications",
	});

	const soundEffectsSwitchLabel = intl.formatMessage({
		id: "quintro.components.QuickSettingsDialog.settingLabels.soundEffects",
		description: "Label for the switch to enable sound effects in the Quick Settings dialog",
		defaultMessage: "Enable Sound Effects",
	});

	return (
		<div>
			<h4>
				<FormattedMessage
					id="quintro.components.QuickSettingsDialog.dialogTitle"
					description="Header for the Quick Settings dialog"
					defaultMessage="Quick Settings"
				/>
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
								disabled={isLoadingStoredSettings || !notificationsSupported()}
								aria-label={notificationsSwitchLabel}
								title={notificationsSwitchLabel}
							/>

							<FormattedMessage
								id="quintro.components.QuickSettingsDialog.settingNames.notifications"
								description="Notifications setting name in the Quick Settings dialog."
								defaultMessage="Notifications"
							/>
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
								title={soundEffectsSwitchLabel}
								aria-label={soundEffectsSwitchLabel}
							/>

							<FormattedMessage
								id="quintro.components.QuickSettingsDialog.settingNames.soundEffects"
								description="Sound Effects setting name in the Quick Settings dialog."
								defaultMessage="Sound Effects"
							/>
						</label>
					</div>
				</form>
			</div>
		</div>
	);
}

export default QuickSettingsDialog;
