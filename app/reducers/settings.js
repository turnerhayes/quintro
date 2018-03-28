import { Map } from "immutable";
import { CHANGE_SETTING } from "@app/actions";

export default function settingsReducer(state = Map(), action) {
	switch(action.type) {
		// case REHYDRATE: {
		// 	const incoming = action.payload.settings;

		// 	if (incoming) {
		// 		state = state.mergeDeep(incoming);
		// 	}

		// 	return state.set("wasRehydrated", true);
		// }

		case CHANGE_SETTING: {
			return state.merge(action.payload);
		}

		default: return state;
	}
}
