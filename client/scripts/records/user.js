import { Record, Map } from "immutable";

const schema = {
	id: null,
	username: "",
	isAdmin: false,
	name: Map({
		first: "",
		middle: null,
		last: null
	}),
	displayName: null,
	location: null,
	profilePhotoURL: null
};

class UserRecord extends Record(schema, "User") {

}

export default UserRecord;
