import { Record } from "immutable";

const schema = {
	userID: null,
	isAnonymous: true,
	isPresent: true,
	order: null,
	color: "",
	user: null
};

class PlayerRecord extends Record(schema, "Player") {
	constructor(args) {
		if (args.user && !args.userID) {
			args.userID = args.user.id;
			delete args.user;
		}

		super(args);
	}
}

export default PlayerRecord;
