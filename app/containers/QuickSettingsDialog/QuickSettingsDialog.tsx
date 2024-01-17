import QuickSettingsDialog from "@app/components/QuickSettingsDialog";
import { useAppDispatch, useAppSelector } from "@app/redux/hooks";
import * as selectors from "@lib/redux/selectors";
import { settingsActions } from "@lib/redux/store";
import { useCallback } from "react";

const QuickSettingsDialogContainer = () => {
    const areNotificationsEnabled = useAppSelector(selectors.areNotificationsEnabled);
    const areSoundEffectsEnabled = useAppSelector(selectors.areSoundEffectsEnabled);
    const dispatch = useAppDispatch();


	const handleChangeSetting = useCallback(({
		enableSoundEffects,
		enableNotifications,
	}: {
		enableSoundEffects?: boolean;
		enableNotifications?: boolean;
	}) => {
		dispatch(settingsActions.changeSetting({
			soundEffectsEnabled: enableSoundEffects,
			notificationsEnabled: enableNotifications,
		}));
	}, []);

    return (
        <QuickSettingsDialog
            onChangeSetting={handleChangeSetting}
            soundEffectsEnabled={areSoundEffectsEnabled}
            notificationsEnabled={areNotificationsEnabled}
        />
    );
};

export default QuickSettingsDialogContainer;
