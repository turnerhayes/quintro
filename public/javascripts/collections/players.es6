import Backbone    from "backbone";
import PlayerModel from "../models/player";

class PlayersCollection extends Backbone.Collection {
	get model() {
		return PlayerModel;
	}

	get self() {
		return this.find({is_self: true});
	}
}

export default PlayersCollection;
