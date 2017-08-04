import { REHYDRATE }  from "redux-persist/constants";
import SettingsRecord from "project/scripts/records/settings";
import {
	CHANGE_SETTING
} from "project/scripts/redux/actions";

export default function settingsReducer(state = new SettingsRecord(), action) {
	switch (action.type) {
		case REHYDRATE: {
			const incoming = action.payload.settings;

			if (incoming) {
				state = state.mergeDeep(incoming);
			}

			return state.set("wasRehydrated", true);
		}

		case CHANGE_SETTING: {
			return state.merge(action.payload);
		}

		default:
			return state;
	}
}
