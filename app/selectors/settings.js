export const getSetting = (state, settingName) => state.getIn([
	"settings",
	settingName
]);
