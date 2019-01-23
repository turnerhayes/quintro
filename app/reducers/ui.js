import { Map, fromJS } from "immutable";
import {
	SET_UI_STATE,
	REMOVE_UI_STATE,
}                      from "@app/actions";

export default function uiReducer(state = Map(), action) {
	switch (action.type) {
		case SET_UI_STATE: {
			const { section, settings } = action.payload;

			return state.mergeIn([section], fromJS(settings));
		}

		case REMOVE_UI_STATE: {
			const { section, settingPath } = action.payload;

			const path = [section];

			if (Array.isArray(settingPath)) {
				path.push(...settingPath);
			}
			else if (settingPath) {
				path.push(settingPath);
			}

			return state.deleteIn(path);
		}

		default: return state;
	}
}
