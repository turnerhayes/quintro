import { useCallback, useEffect, useState, type ChangeEvent }        from "react";
import Switch       from "@mui/material/Switch";
import {
	FormattedMessage,
	useIntl,
}                   from "react-intl";
import { NOTIFICATIONS_SUPPORTED, needsPermission, requestPermission } from "./notify.client";
import { MenuItem, Select, Stack, useColorScheme, type SelectProps, type SupportedColorScheme } from "@mui/material";
import { useAppSelector } from "@/redux/hooks";
import { getColorScheme, getNotificationsEnabled, getSoundEffectsEnabled } from "@/redux/selectors/settings";
import { setColorScheme, setNotificationsEnabled, setSoundEffectsEnabled } from "@/redux/slices/settings";


/**
 * Component representing a dialog providing quick access to certain settings.
 *
 * @memberof client.react-components
 */
export const QuickSettingsDialog = (
) => {
	const intl = useIntl();
	const [isMounted, setIsMounted] = useState(false);
	const { mode: colorScheme, setMode} = useColorScheme();
	const soundEffectsEnabled = useAppSelector(getSoundEffectsEnabled);
	const notificationsEnabled = useAppSelector(getNotificationsEnabled);
	const reduxColorScheme = useAppSelector(getColorScheme);

	useEffect(() => {
		if (!isMounted) {
			setIsMounted(true);
			if (reduxColorScheme != null) {
				setMode(reduxColorScheme);
			}
		}
	}, [
		isMounted,
		setIsMounted,
		reduxColorScheme,
	]);

	const onChangeSetting = useCallback(
		(settings: {
			enableSoundEffects?: boolean;
			enableNotifications?: boolean;
			colorScheme?: SupportedColorScheme;
		}) => {
			if (settings.enableSoundEffects != null) {
				setSoundEffectsEnabled(settings.enableSoundEffects);
			}
			if (settings.enableNotifications != null) {
				setNotificationsEnabled(settings.enableNotifications);
			}
			if (settings.colorScheme != null) {
				setMode(settings.colorScheme);
				setColorScheme(settings.colorScheme as SupportedColorScheme);
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
		(event: Parameters<NonNullable<SelectProps<SupportedColorScheme>["onChange"]>>[0]) => {
			const scheme = event.target.value as SupportedColorScheme;

			onChangeSetting({
				colorScheme: scheme,
			});
		},
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
