import { Record, Map, Set } from "immutable";

const schema = {
	items: Map(),
	currentID: null,
	subscriptions: Set(),
	isChangingSubscription: false
};

class UsersStateRecord extends Record(schema, "UsersState") {
	get currentUser() {
		return this.getIn(["items", this.currentID]);
	}
}

export default UsersStateRecord;
