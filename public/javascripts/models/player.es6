import assert   from "assert";
import Backbone from "backbone";

class PlayerModel extends Backbone.Model {
	get defaults() {
		return {
			user: undefined,
			color: undefined,
			is_self: false
		};
	}
}

export default PlayerModel;
