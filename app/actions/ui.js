export const SET_UI_STATE = "@@QUINTRO/UI/SET_STATE";

/**
 * Get an action to set a UI setting.
 * 
 * @param {object} options
 * @param {string} options.section - the name of the UI section to which to
 * 	add settings
 * @param {object} options.settings - key-value map specifying the new values
 * 	of the settings
 * 
 * @returns {object} Redux action
 */
export function setUIState({ section, settings}) {
	return {
		type: SET_UI_STATE,
		payload: {
			section,
			settings,
		},
	};
}

export const REMOVE_UI_STATE = "@@QUINTRO/UI/REMOVE_STATE";

/**
 * Get an action to remove a UI setting, or entire UI setting section.
 * 
 * @param {object} options
 * @param {string} options.section - the name of the UI section from which to
 * 	remove settings
 * @param {string|string[]} [options.settingPath] - the name of the setting or path
 * 	to the setting to remove. If omitted, the entire section will be removed.
 * 
 * @throws if a `settingPath` parameter is passed, but its value is `undefined`. This
 * 	is to prevent accidental deletion of an entire UI section. In order to delete
 * 	an entire section, either don't pass a `settingPath` parameter or set it to `null`.
 * 
 * @returns {object} Redux action
 */
export function removeUIState(options) {
	const { section, settingPath } = options;

	if ("settingPath" in options && settingPath === undefined) {
		throw new Error("You called `removeUIState()` but passed in `undefined` for the `settingPath`" +
			" parameter. This might be a mistake. If you mean to remove the entire UI section, either" +
			" do not pass a `settingPath` argument or set it to `null`");
	}

	return {
		type: REMOVE_UI_STATE,
		payload: {
			section,
			settingPath,
		}
	};
}
