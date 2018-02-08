import { connect }   from "react-redux";
import QuickSettingsDialog from "@app/components/QuickSettingsDialog";
import {
	changeSetting
}                   from "@app/actions";
import { settings as settingsSelectors } from "@app/selectors";

const QuickSettingsDialogContainer = connect(
	function mapStateToProps(state) {
		return {
			enableSoundEffects: settingsSelectors.getSetting(state, "enableSoundEffects"),
			enableNotifications: settingsSelectors.getSetting(state, "enableNotifications"),
			// isLoadingStoredSettings: !settings.wasRehydrated,
			isLoadingStoredSettings: false,
		};
	},

	function mapDisaptchToProps(dispatch) {
		return {
			onChangeSetting(setting) {
				dispatch(changeSetting(setting));
			},
		};
	}
)(QuickSettingsDialog);

QuickSettingsDialogContainer.displayName = "QuickSettingsDialogContainer";

export default QuickSettingsDialogContainer;
