import assert from "assert";

export const getSetting = (state, options) => {
	assert(options.section, "`section` is required");
	assert(options.settingName, "`settingName` is required");

	return state.getIn([
		"ui",
		options.section,
		...(
			Array.isArray(options.settingName) ?
				options.settingName :
				[options.settingName]
		)
	]);
};
