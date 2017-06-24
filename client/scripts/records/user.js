import { Record, Map } from "immutable";
import assert          from "assert";

const schema = {
	id: null,
	username: "",
	isAdmin: false,
	name: null,
	displayName: null,
	location: null,
	profilePhotoURL: null,
	isMe: false
};

class UserRecord extends Record(schema, "User") {
	get isAnonymous() {
		return !!this.username;
	}

	constructor(args) {
		if (args.name) {
			assert(args.name.first, "'name.first' is required if 'name' is specified");
		}

		args.name = Map(args.name);

		super(args);
	}
}

export default UserRecord;
