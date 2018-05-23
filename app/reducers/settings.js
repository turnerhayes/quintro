import { Map } from "immutable";
import { CHANGE_SETTING } from "@app/actions";

export default function settingsReducer(state = Map(), action) {
	switch(action.type) {
		case CHANGE_SETTING: {
			return state.merge(action.payload);
		}

		default: return state;
	}
}
