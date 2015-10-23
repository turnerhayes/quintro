import _         from "lodash";
import Backbone  from "backbone";
import UserModel from "./user";

class PlayerModel extends Backbone.Model {
	get defaults() {
		return {
			user: undefined,
			color: undefined,
			is_self: false
		};
	}

	initialize() {
		var model = this;

		if (_.isObject(model.get('user'))) {
			model.set('user', new UserModel(model.get('user')));
		}
	}

	toJSON() {
		var model = this;

		var json = super.toJSON.apply(model);

		json.user = model.get('user').toJSON();

		return json;
	}
}

export default PlayerModel;
