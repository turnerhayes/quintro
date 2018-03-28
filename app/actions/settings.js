export const CHANGE_SETTING = "@@QUINTRO/SETTINGS/CHANGE";

export function changeSetting(settingValues) {
	return {
		type: CHANGE_SETTING,
		payload: settingValues
	};
}
