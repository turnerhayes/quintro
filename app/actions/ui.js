export const SET_UI_STATE = "@@QUINTRO/UI/SET_STATE";

export function setUIState({ section, settings}) {
	return {
		type: SET_UI_STATE,
		payload: {
			section,
			settings,
		},
	};
}
