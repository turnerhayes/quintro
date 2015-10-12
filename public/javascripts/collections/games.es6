import Q         from 'q';
import Backbone  from 'backbone';
import GameModel from '../models/game';

class GamesCollection extends Backbone.Collection {
	get model() {
		return GameModel;
	}

	fetchGame(short_id) {
		var collection = this;

		if (collection.get(short_id)) {
			return Q(collection.get(short_id));
		}

		var model = new (collection.model)({
			short_id: short_id
		});

		return Q(model.fetch()).then(
			function() {
				return model;
			}
		);
	}
}

export default GamesCollection;