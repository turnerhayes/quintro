import Backbone from "backbone";

export default class UserModel extends Backbone.Model {
	get defaults() {
		return {
			name: {
				first: undefined,
				middle: undefined,
				last: undefined
			},
			username: undefined,
			preferredDisplayName: undefined,
			email: undefined,
			profilePhotoURL: undefined
		};
	}

	get url() {
		return "/user/" + this.get('username');
	}

	equals(other) {
		var model = this;

		if (!other) {
			return false;
		}

		return model.get('id') === other.get('id');
	}
}
