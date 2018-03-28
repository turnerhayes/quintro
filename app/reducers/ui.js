import { Map, fromJS } from "immutable";
import {
	SET_UI_STATE
}                      from "@app/actions";

export default function uiReducer(state = Map(), action) {
	switch (action.type) {
		case SET_UI_STATE: {
			const { section, settings } = action.payload;

			return state.mergeIn([section], fromJS(settings));
		}

		default: return state;
	}
}
