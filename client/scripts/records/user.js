import { Record, Map } from "immutable";

const schema = {
	id: null,
	username: "",
	isAdmin: false,
	isAnonymous: true,
	isMe: false,
	name: null,
	provider: null
};

class UserRecord extends Record(schema, "User") {
	constructor(args) {
		args.name = Map(args.name);

		super(args);
	}
}

export default UserRecord;
