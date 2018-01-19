import QuickSettingsDialog from "project/scripts/components/QuickSettingsDialog";
import { connect }         from "react-redux";
import {
	changeSetting
}                   from "project/scripts/redux/actions";

const QuickSettingsDialogContainer = connect(
	function mapStateToProps(state) {
		const settings = state.get("settings");

		return {
			enableSoundEffects: settings.enableSoundEffects,
			enableNotifications: settings.enableNotifications,
			isLoadingStoredSettings: !settings.wasRehydrated
		};
	},

	function mapDispatchToProps(dispatch) {
		return {
			onChangeSetting(setting) {
				dispatch(changeSetting(setting));
			}
		};
	}
)(QuickSettingsDialog);

QuickSettingsDialogContainer.displayName = "QuickSettingsDialogContainer";

export default QuickSettingsDialogContainer;
