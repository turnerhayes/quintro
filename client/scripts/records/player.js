import { Record } from "immutable";

const schema = {
	user: null,
	color: ""
};

class PlayerRecord extends Record(schema, "Player") {

}

export default PlayerRecord;
