import { Record } from "immutable";

const schema = {
	enableSoundEffects: false,
	enableNotifications: false,
	wasRehydrated: false
};

export default class SettingsRecord extends Record(schema, "Settings") {}
