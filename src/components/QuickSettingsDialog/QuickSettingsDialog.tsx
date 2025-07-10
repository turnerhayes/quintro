import { useCallback, type ChangeEvent }        from "react";
import {
	FormattedMessage,
	useIntl,
}                   from "react-intl";
import {
	MenuItem,
	Select,
	Switch,
	Stack,
	useColorScheme,
	type SelectProps,
	type SupportedColorScheme
} from "@mui/material";
import { NOTIFICATIONS_SUPPORTED, needsPermission, requestPermission } from "./notify.client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getNotificationsEnabled, getSoundEffectsEnabled } from "@/redux/selectors/settings";
import { setNotificationsEnabled, setSoundEffectsEnabled } from "@/redux/slices/settings";


/**
 * Component representing a dialog providing quick access to certain settings.
 *
 * @memberof client.react-components
 */
export const QuickSettingsDialog = () => {
	const intl = useIntl();
	const { mode: colorScheme, setMode} = useColorScheme();
	const soundEffectsEnabled = useAppSelector(getSoundEffectsEnabled);
	const notificationsEnabled = useAppSelector(getNotificationsEnabled);
	const dispatch = useAppDispatch();

	const onChangeSetting = useCallback(
		(settings: {
			enableSoundEffects?: boolean;
			enableNotifications?: boolean;
			colorScheme?: SupportedColorScheme;
		}) => {
			if (settings.enableSoundEffects != null) {
				dispatch(setSoundEffectsEnabled(settings.enableSoundEffects));
			}
			if (settings.enableNotifications != null) {
				dispatch(setNotificationsEnabled(settings.enableNotifications));
			}
			if (settings.colorScheme != null) {
				// MUI takes care of storing color scheme preferences in localStorage
				// so we don't have to
				setMode(settings.colorScheme);
			}
		},
		[
			setSoundEffectsEnabled,
			setNotificationsEnabled,
			setMode,
		]
	);

	/**
	 * Toggles whether or not the sound effects setting is enabled.
	 */
	const toggleEnableSoundEffects = useCallback(
		(status: boolean) => {
			onChangeSetting({
				enableSoundEffects: status,
			});
		},
		[
			onChangeSetting,
		]
	);

	/**
	 * Toggles whether or not the browser notifications setting is enabled.
	 */
	const toggleEnableNotifications = useCallback(
		async (status: boolean) => {
			if (!notificationsEnabled) {
				// Notifications are not yet enabled
				if (status) {
					// Notifications are being enabled
					if (needsPermission != null && needsPermission) {
						// We need permission
						await requestPermission();
					}
				}
			}

			onChangeSetting({
				enableNotifications: status
			});
		},
		[
			onChangeSetting,
		]
	);

	/**
	 * Toggles what color scheme should be used.
	 */
	const onChangeColorScheme = useCallback(
		((event) => {
			const scheme = event.target.value as SupportedColorScheme;

			onChangeSetting({
				colorScheme: scheme,
			});
		}) as NonNullable<SelectProps<"light"|"dark"|"system">["onChange"]>,
		[
			onChangeSetting,
		]
	);

	const handleChangeNotifications = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			return toggleEnableNotifications(event.target.checked);
		},
		[
			toggleEnableNotifications,
		]
	);

	const handleChangeSoundEffects = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			toggleEnableSoundEffects(event.target.checked);
		},
		[
			toggleEnableSoundEffects,
		]
	);

	return (
		<div>
			<h4>
				<FormattedMessage
					id="quintro.components.QuickSettingsDialog.dialogTitle"
					defaultMessage="Quick Settings"
				/>
			</h4>
			<Stack
			>
				<div
				>
					<label>
						<Switch
							className="notifications-switch"
							checked={notificationsEnabled}
							onChange={handleChangeNotifications}
							disabled={!NOTIFICATIONS_SUPPORTED}
							aria-label={intl.formatMessage({
								id: "quintro.components.QuickSettingsDialog.settingLabels.notifications",
								defaultMessage: "Enable Browser Notifications",
							})}
						/>

						<FormattedMessage
							id="quintro.components.QuickSettingsDialog.settingNames.notifications"
							defaultMessage="Notifications"
						/>
					</label>
				</div>
				<div
				>
					<label>
						<Switch
							checked={soundEffectsEnabled}
							onChange={handleChangeSoundEffects}
							aria-label={intl.formatMessage({
								id: "quintro.components.QuickSettingsDialog.settingLabels.soundEffects",
								defaultMessage: "Enable Sound Effects",
							})}
						/>

						<FormattedMessage
							id="quintro.components.QuickSettingsDialog.settingNames.soundEffects"
							defaultMessage="Sound Effects"
						/>
					</label>
				</div>
				{
					colorScheme == null ? null : (
						<div>
							<label>
								<Select
									value={colorScheme}
									onChange={onChangeColorScheme}
									size="small"
									sx={{
										marginRight: 1,
									}}
								>
									<MenuItem value="light">
										<FormattedMessage
											id="quintro.components.QuickSettingsDialog.colorSchemes.light"
											defaultMessage="Light"
										/>
									</MenuItem>
									<MenuItem value="dark">
										<FormattedMessage
											id="quintro.components.QuickSettingsDialog.colorSchemes.dark"
											defaultMessage="Dark"
										/>
									</MenuItem>
									<MenuItem value="system">
										<FormattedMessage
											id="quintro.components.QuickSettingsDialog.colorSchemes.system"
											defaultMessage="System"
										/>
									</MenuItem>
								</Select>
								<FormattedMessage
									id="quintro.components.QuickSettingsDialog.settingLabels.colorScheme"
									defaultMessage="Color Scheme"
								/>
							</label>
						</div>
					)
				}
			</Stack>
		</div>
	);
}
